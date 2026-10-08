"use client";

import Link from "next/link";
import type { PersonPreview } from "@/models/types";
import { AvatarStack } from "@/components/ui/avatar";

/** Counter card: blue title, big number, avatars on the right; the whole card is a link. */
export const StatCard = ({ title, count, people, href }: { title: string; count: number; people: PersonPreview[]; href: string }) => (
  <Link
    href={href}
    className="flex items-center justify-between gap-3 rounded-md border border-divider bg-card px-4 py-3 transition-colors hover:border-primary-light"
  >
    <span>
      <span className="block text-counter font-semibold text-primary">{title}</span>
      <span className="block text-[32px] leading-10 text-foreground">{count}</span>
    </span>
    {people.length > 0 && <AvatarStack people={people} avatarClassName="size-14" />}
  </Link>
);
