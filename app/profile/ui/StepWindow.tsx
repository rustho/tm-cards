"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button, WindowTitleBar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useWizardContext } from "./WizardContext";

interface StepWindowProps {
  title: ReactNode;
  children: ReactNode;
  onNext: () => void;
  nextDisabled?: boolean;
  nextText?: ReactNode;
  bodyClassName?: string;
}

/**
 * XP wizard step shell: a window (title bar + scrollable body) that fills the
 * available height, with the full-width primary "Далее" button below it.
 * In a single-step edit (`editing`) the button always reads «Сохранить».
 */
export function StepWindow({
  title,
  children,
  onNext,
  nextDisabled = false,
  nextText,
  bodyClassName,
}: StepWindowProps) {
  const t = useTranslations("common");
  const { editing } = useWizardContext();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <section className="flex min-h-0 flex-1 flex-col">
        <WindowTitleBar title={title} />
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto rounded-b-md border border-t-0 border-divider bg-background p-3",
            bodyClassName
          )}
        >
          {children}
        </div>
      </section>
      <Button
        variant="primary"
        size="block"
        className="shrink-0"
        disabled={nextDisabled}
        onClick={() => {
          if (!nextDisabled) onNext();
        }}
      >
        {editing ? t("save") : nextText ?? t("next")}
      </Button>
    </div>
  );
}
