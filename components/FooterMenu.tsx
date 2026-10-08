"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil, Play, Send, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/home", icon: Users, key: "people" },
  { href: "/invitations", icon: Send, key: "invitations" },
  { href: "/icebreaker", icon: Play, key: "meetings" },
  { href: "/profile", icon: Pencil, key: "questionnaire" },
  { href: "/settings", icon: User, key: "account" },
] as const;

/** Floating bottom tab bar. Pages include it explicitly; it is not part of the layout. */
export const FooterMenu = () => {
  const pathname = usePathname();
  const t = useTranslations("menu");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-label="Main"
    >
      <ul className="m-0 flex list-none rounded-[2rem] bg-card px-1 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        {ITEMS.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
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
  );
};
