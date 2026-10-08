"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight, Pencil, Play, Send, User, Users } from "lucide-react";
import type { PendingFeedback } from "@/models/types";
import { getPendingFeedback } from "@/lib/pendingFeedback";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

const ITEMS = [
  { href: "/home", icon: Users, key: "people" },
  { href: "/invitations", icon: Send, key: "invitations" },
  { href: "/meetings", icon: Play, key: "meetings" },
  // Exact: /profile/<id> is someone else's questionnaire, not my wizard.
  { href: "/profile", icon: Pencil, key: "questionnaire", exact: true },
  { href: "/settings", icon: User, key: "account" },
] as const;

/**
 * Floating bottom tab bar. Pages include it explicitly; it is not part of the layout.
 * Above it: «Как прошло знакомство?» while a recent meeting waits for my impression,
 * unless the page already shows that flow (`hideReminder`).
 */
export const FooterMenu = ({ hideReminder = false }: { hideReminder?: boolean }) => {
  const pathname = usePathname();
  const t = useTranslations("menu");
  const [loaded, setLoaded] = useState<PendingFeedback | null>(null);
  const pending = hideReminder ? null : loaded;

  useEffect(() => {
    let cancelled = false;
    getPendingFeedback().then((data) => !cancelled && setLoaded(data));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Keeps page content clear of the reminder (pages already reserve room for the bar). */}
      {pending && <div className="h-20" aria-hidden />}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 space-y-2 px-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        aria-label="Main"
      >
        {pending && (
          <Link
            href={`/home/meetings/${pending.matchId}`}
            className="flex items-center gap-3 rounded-[1.25rem] bg-card px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          >
            <span className="min-w-0 flex-1 text-counter text-primary">{t("feedbackReminder")}</span>
            <Avatar name={pending.partner.name} photo={pending.partner.photo} className="size-11" />
            <ChevronRight className="size-5 shrink-0 text-primary" aria-hidden />
          </Link>
        )}
        <ul className="m-0 flex list-none rounded-[2rem] bg-card px-1 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {ITEMS.map(({ href, icon: Icon, key, ...item }) => {
            const active = pathname === href || (!("exact" in item) && pathname.startsWith(`${href}/`));
            return (
              <li key={href} className="min-w-0 flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1.5 text-xs leading-none tracking-tight transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                  <span className="max-w-full whitespace-nowrap">{t(key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
