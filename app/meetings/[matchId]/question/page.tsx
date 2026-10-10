"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { WeeklyQuestion } from "@/models/types";
import { useCachedApi } from "@/lib/apiCache";
import { Button } from "@/components/ui/button";
import { BottomAction } from "@/components/meetings/BottomAction";

/** «Вопрос недели»: the pair's shared question card; «Готово» goes back. */
export default function WeeklyQuestionPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const t = useTranslations("weekMatch");
  const { data: question, error } = useCachedApi<WeeklyQuestion>(`/api/meetings/${matchId}/question`);
  const failed = !question && !!error;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pb-28 pt-6">
      <h1 className="m-0 text-center text-option font-semibold">{t("questionTitle")}</h1>
      <div className="flex flex-1 items-center justify-center py-8">
        {failed ? (
          <p className="m-0 text-center text-body text-muted-foreground">{t("questionLocked")}</p>
        ) : !question ? (
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label={t("loading")} />
        ) : (
          <div className="flex aspect-[4/5] w-full flex-col justify-center rounded-xl bg-primary p-8 text-center text-primary-foreground shadow-[0_8px_0_hsl(var(--primary-muted))]">
            <p className="m-0 flex flex-1 items-center justify-center text-[26px] font-bold leading-9 text-primary-foreground">
              {question.text}
            </p>
            <p className="m-0 text-body text-primary-foreground/90">{question.category}</p>
          </div>
        )}
      </div>
      <BottomAction>
        <Button variant="outline" size="block" className="border-primary text-primary" onClick={() => router.back()}>
          {t("done")}
        </Button>
      </BottomAction>
    </div>
  );
}
