"use client";

import { useCallback, useEffect, useState } from "react";
import { initData } from "@tma.js/sdk-react";
import { api, ApiError } from "@/lib/api";

/**
 * Stale-while-revalidate cache for our GET routes (client).
 *
 * Every DB round trip is slow, so a screen renders the last known response at
 * once (memory, then localStorage across app launches) and refetches it in the
 * background; subscribers re-render when the fresh copy arrives. Entries are
 * keyed by the Telegram user id so two accounts on one device never mix.
 * Mutations either write the new value (`writeCache` / `updateCache`) or drop
 * it (`invalidateCache`).
 */

type Entry = { data: unknown; at: number };

const STORAGE_PREFIX = "tm-cache:v1:";
/** Entries older than this are not shown at all (a stale week phase is worse than a spinner). */
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

const memory = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
const listeners = new Map<string, Set<() => void>>();
/** Bumped on every write, so a GET that started before a mutation cannot overwrite it. */
const generation = new Map<string, number>();

function storageKey(url: string): string | null {
  try {
    const userId = initData.user()?.id;
    return userId ? `${STORAGE_PREFIX}${userId}:${url}` : null;
  } catch {
    return null;
  }
}

function notify(url: string) {
  listeners.get(url)?.forEach((listener) => listener());
}

/** The cached response for `url`, or undefined. `null` is a cached "not found". */
export function readCache<T>(url: string): T | undefined {
  let entry = memory.get(url);
  if (!entry) {
    const key = storageKey(url);
    try {
      const raw = key ? localStorage.getItem(key) : null;
      if (raw) {
        entry = JSON.parse(raw) as Entry;
        memory.set(url, entry);
      }
    } catch {
      // storage blocked or corrupt: behave as a miss
    }
  }
  if (!entry || Date.now() - entry.at > MAX_AGE_MS) return undefined;
  return entry.data as T;
}

export function writeCache<T>(url: string, data: T) {
  const entry: Entry = { data, at: Date.now() };
  memory.set(url, entry);
  generation.set(url, (generation.get(url) ?? 0) + 1);
  const key = storageKey(url);
  try {
    if (key) localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // quota or blocked storage: the memory copy is enough
  }
  notify(url);
}

/** Patches a cached value in place; does nothing when there is none. */
export function updateCache<T>(url: string, patch: (current: T) => T) {
  const current = readCache<T>(url);
  if (current !== undefined && current !== null) writeCache(url, patch(current));
}

/** Drops cached values, so the next screen waits for fresh data. */
export function invalidateCache(...urls: string[]) {
  for (const url of urls) {
    memory.delete(url);
    generation.set(url, (generation.get(url) ?? 0) + 1);
    const key = storageKey(url);
    try {
      if (key) localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

export type FetchOptions = {
  /** Treat 404 as an empty result (`null`) instead of an error. */
  allowNotFound?: boolean;
};

/** GET through the cache: concurrent calls for one url share a request; the result is stored. */
export function fetchCached<T>(url: string, { allowNotFound = false }: FetchOptions = {}): Promise<T | null> {
  let request = inflight.get(url) as Promise<T | null> | undefined;
  if (!request) {
    const startedAt = generation.get(url) ?? 0;
    request = api
      .get<T>(url)
      .catch((error) => {
        if (allowNotFound && error instanceof ApiError && error.status === 404) return null;
        throw error;
      })
      .then((data) => {
        if ((generation.get(url) ?? 0) !== startedAt) return readCache<T>(url) ?? data;
        writeCache(url, data);
        return data;
      })
      .finally(() => inflight.delete(url));
    inflight.set(url, request);
  }
  return request;
}

/** Warms the cache in the background (app start), so tabs open with data. */
export function prefetch(entries: (string | [string, FetchOptions])[]) {
  for (const entry of entries) {
    const [url, options] = typeof entry === "string" ? [entry, undefined] : entry;
    fetchCached(url, options).catch(() => {
      // the screen will retry and report the error itself
    });
  }
}

/**
 * `data` is the cached value right away (undefined = nothing yet; null = 404 with
 * `allowNotFound`), then the fresh one. `error` is set only when the refetch failed;
 * screens show cached data over an error. Pass `null` as url to skip.
 */
export function useCachedApi<T>(url: string | null, options: FetchOptions = {}) {
  const { allowNotFound = false } = options;
  const [data, setData] = useState<T | null | undefined>(() => (url ? readCache<T>(url) : undefined));
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!url) return;
    setData(readCache<T>(url));
    const listener = () => setData(readCache<T>(url));
    let set = listeners.get(url);
    if (!set) listeners.set(url, (set = new Set()));
    set.add(listener);
    return () => {
      set.delete(listener);
    };
  }, [url]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setRefreshing(true);
    setError(null);
    fetchCached<T>(url, { allowNotFound })
      .catch((e) => {
        console.error(`Error fetching ${url}:`, e);
        if (!cancelled) setError(e);
      })
      .finally(() => !cancelled && setRefreshing(false));
    return () => {
      cancelled = true;
    };
  }, [url, allowNotFound, version]);

  /** Optimistic local change, persisted to the cache. */
  const mutate = useCallback(
    (next: T | null) => {
      if (url) writeCache(url, next);
    },
    [url]
  );
  /** Refetch now (e.g. after a mutation the server reshapes). */
  const refresh = useCallback(() => setVersion((n) => n + 1), []);

  return { data, error, refreshing, mutate, refresh };
}
