"use client";

import type { ReactNode } from "react";
import { MessageCircleMore } from "lucide-react";
import type { PersonPreview } from "@/models/types";
import { Avatar } from "@/components/ui/avatar";
import { BottomAction } from "./BottomAction";

/**
 * «Супер!»: both photos joined by a dashed line, title, text, optional extra block and a bottom action.
 * `aboveFooter` when the page also shows the FooterMenu.
 */
export const CelebrationScreen = ({
  me,
  partner,
  title,
  text,
  children,
  action,
  aboveFooter,
}: {
  me: PersonPreview;
  partner: PersonPreview;
  title: string;
  text: string;
  children?: ReactNode;
  action: ReactNode;
  aboveFooter?: boolean;
}) => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
    <div className="relative flex w-full max-w-sm items-center justify-between">
      <span className="absolute inset-x-16 top-1/2 border-t-2 border-dashed border-primary-light" aria-hidden />
      <Avatar name={me.name} photo={me.photo} className="relative size-32 text-3xl" />
      <span className="relative flex size-14 items-center justify-center rounded-full bg-primary-muted">
        <MessageCircleMore className="size-7 fill-primary text-primary-muted" aria-hidden />
      </span>
      <Avatar name={partner.name} photo={partner.photo} className="relative size-32 text-3xl" />
    </div>
    <div className="space-y-3">
      <h1 className="m-0 text-[32px] font-bold leading-10">{title}</h1>
      <p className="m-0 mx-auto max-w-sm text-counter text-muted-foreground">{text}</p>
    </div>
    {children && <div className="w-full">{children}</div>}
    <BottomAction aboveFooter={aboveFooter}>{action}</BottomAction>
  </div>
);
