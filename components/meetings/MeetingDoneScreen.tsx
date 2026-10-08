"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageCircleMore } from "lucide-react";
import type { PersonPreview } from "@/models/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BottomAction } from "./BottomAction";

/** «Супер!»: both photos joined by a dashed line, a message, and «Понятно» back to the «Люди» tab. */
export const MeetingDoneScreen = ({ me, partner, title, text }: { me: PersonPreview; partner: PersonPreview; title: string; text: string }) => {
  const router = useRouter();
  const t = useTranslations("meetings.done");

  return (
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
        <h1 className="m-0 text-[40px] font-bold leading-[48px]">{title}</h1>
        <p className="m-0 mx-auto max-w-sm text-counter text-muted-foreground">{text}</p>
      </div>
      <BottomAction>
        <Button variant="primary" size="block" onClick={() => router.push("/home")}>
          {t("ok")}
        </Button>
      </BottomAction>
    </div>
  );
};
