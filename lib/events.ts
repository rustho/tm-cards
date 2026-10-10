import type { Prisma } from "@prisma/client";
import { waitUntil } from "@vercel/functions";
import prisma from "@/lib/prisma";

/**
 * Server-side product events (table `events`) for the funnel and the admin
 * audit log. `track()` never delays a response: the insert runs after it,
 * kept alive on Vercel by waitUntil(), and a failure is only logged.
 */

export type EventName =
  | "app_visit"
  | "onboarding_step"
  | "onboarding_completed"
  | "week_signup"
  | "week_skip"
  | "match_accepted"
  | "match_mutual"
  | "feedback_left"
  | "bot_started"
  | "bot_blocked"
  | "bot_unblocked"
  | "admin_message"
  | "admin_user_status"
  | "admin_access_granted"
  | "admin_access_revoked"
  | "admin_match_cancelled"
  | "admin_matching_run"
  | "admin_matching_config"
  | "admin_broadcast";

export function track(name: EventName, userId: string | null, props?: Record<string, unknown>): void {
  const write = prisma.event
    .create({ data: { name, userId, props: props as Prisma.InputJsonValue | undefined } })
    .catch((error) => console.warn(`⚠️ Event ${name} not saved:`, error instanceof Error ? error.message : error));
  waitUntil(write);
}
