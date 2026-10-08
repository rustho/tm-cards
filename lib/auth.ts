import { NextResponse } from "next/server";
import { parse, validate } from "@tma.js/init-data-node/web";
import { ADMIN_TELEGRAM_IDS } from "@/config/constants";
import prisma from "@/lib/prisma";

/**
 * Server-side authentication for Telegram Mini App requests.
 *
 * Clients send `Authorization: tma <initDataRaw>` (see lib/api.ts). The raw
 * init data is validated against TELEGRAM_BOT_TOKEN with
 * @tma.js/init-data-node (Web Crypto build, so it also works on the edge).
 *
 * In development the signature check is skipped with a warning when it
 * fails, because the browser mock (core/mockEnv.ts) cannot produce a valid
 * hash. In production it is always enforced.
 */

export interface AuthUser {
  /** Telegram user id as a string — the key used across the DB (`telegramId`). */
  id: string;
  numericId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  isAdmin: boolean;
}

export class AuthError extends Error {
  constructor(
    public readonly status: 401 | 403 | 500,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const HEADER_PREFIX = "tma ";
/** Init data older than this is rejected (seconds). */
const INIT_DATA_TTL_SECONDS = 60 * 60 * 24;

function extractRawInitData(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith(HEADER_PREFIX)) return null;
  const raw = header.slice(HEADER_PREFIX.length).trim();
  return raw.length > 0 ? raw : null;
}

/**
 * Validates the request's init data and returns the Telegram user.
 * Throws AuthError(401) when the data is missing or invalid.
 */
export async function authenticate(request: Request): Promise<AuthUser> {
  const raw = extractRawInitData(request);
  if (!raw) {
    throw new AuthError(401, "Missing Telegram init data");
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const isDev = process.env.NODE_ENV === "development";

  if (!token) {
    if (!isDev) {
      throw new AuthError(500, "TELEGRAM_BOT_TOKEN is not configured");
    }
    console.warn("⚠️ TELEGRAM_BOT_TOKEN missing: accepting unsigned init data (development only)");
  } else {
    try {
      await validate(raw, token, { expiresIn: INIT_DATA_TTL_SECONDS });
    } catch (error) {
      if (!isDev) {
        throw new AuthError(401, "Invalid Telegram init data");
      }
      console.warn(
        "⚠️ Init data signature check failed, accepting anyway (development only):",
        error instanceof Error ? error.message : error
      );
    }
  }

  let data: ReturnType<typeof parse>;
  try {
    data = parse(raw);
  } catch {
    throw new AuthError(401, "Malformed Telegram init data");
  }

  const user = data.user;
  if (!user) {
    throw new AuthError(401, "Init data does not contain a user");
  }

  return {
    id: String(user.id),
    numericId: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    languageCode: user.language_code,
    isAdmin: ADMIN_TELEGRAM_IDS.includes(user.id),
  };
}

/** Like authenticate(), but additionally requires an admin id. */
export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await authenticate(request);
  if (!user.isAdmin) {
    throw new AuthError(403, "Admin access required");
  }
  return user;
}

/**
 * Converts an AuthError into a JSON response. Returns null for other errors
 * so callers can fall through to their own 500 handling.
 */
export function authErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}

/**
 * Makes sure a MatchingUser row exists for the authenticated user so that
 * dependent rows (UserSettings) can reference it. Only fills Telegram-derived
 * fields on creation; never overwrites profile data.
 */
export async function ensureUser(user: AuthUser) {
  return prisma.matchingUser.upsert({
    where: { telegramId: user.id },
    update: {},
    create: {
      telegramId: user.id,
      username: user.username ?? null,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
      interests: [],
      hobbies: [],
      personalityTraits: [],
      placesToVisit: [],
      previousMatches: [],
    },
  });
}
