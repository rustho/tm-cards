"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { PersonPreview } from "@/models/types";
import { Button } from "@/components/ui/button";
import { CelebrationScreen } from "./CelebrationScreen";

/** Final screen of the feedback flow; «Понятно» goes back to the «Люди» tab. */
export const MeetingDoneScreen = ({ me, partner, title, text }: { me: PersonPreview; partner: PersonPreview; title: string; text: string }) => {
  const router = useRouter();
  const t = useTranslations("meetings.done");

  return (
    <CelebrationScreen
      me={me}
      partner={partner}
      title={title}
      text={text}
      action={
        <Button variant="primary" size="block" onClick={() => router.push("/home")}>
          {t("ok")}
        </Button>
      }
    />
  );
};
