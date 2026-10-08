"use client";

import { api } from "@/lib/api";
import type { PendingFeedback } from "@/models/types";

let cached: Promise<PendingFeedback | null> | null = null;

/** Meeting waiting for my impression; fetched once per session and shared by every FooterMenu. */
export function getPendingFeedback(): Promise<PendingFeedback | null> {
  cached ??= api.get<PendingFeedback | null>("/api/meetings/pending-feedback").catch((error) => {
    console.error("Error fetching pending feedback:", error);
    cached = null;
    return null;
  });
  return cached;
}

/** Call after leaving feedback so the reminder refreshes. */
export function invalidatePendingFeedback() {
  cached = null;
}
