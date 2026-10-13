"use client";

import Link from "next/link";
import type { PersonPreview } from "@/models/types";
import { AvatarStack } from "@/components/ui/avatar";

/** Counter card with a light-blue outline: bold title, big number, avatars on the right; the whole card is a link. */
export const StatCard = ({ title, count, people, href }: { title: string; count: number; people: PersonPreview[]; href: string }) => (
  <Link
    href={href}
    className="flex items-center justify-between gap-3 rounded-[12px] border border-primary-light/50 bg-card px-4 py-3 transition-colors hover:border-primary-light"
  >
    <span>
      <span className="block text-option font-semibold text-foreground">{title}</span>
      <span className="block text-[32px] leading-10 text-foreground">{count}</span>
    </span>
    {people.length > 0 && <AvatarStack people={people} avatarClassName="size-14 ring-4" />}
  </Link>
);
