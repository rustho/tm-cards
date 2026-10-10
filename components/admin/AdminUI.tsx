"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FooterMenu } from "@/components/FooterMenu";
import { BackButton } from "@/components/ui/back-button";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Building blocks of the admin screens (`/admin/*`): page shell, sections, stats, badges. */

export function AdminPage({ title, back = true, actions, children }: { title: ReactNode; back?: boolean; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-28 pt-4">
        {back && <BackButton />}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="m-0 text-title text-foreground">{title}</h1>
          {actions}
        </div>
        {children}
      </div>
      <FooterMenu />
    </div>
  );
}

export function Section({ title, aside, children, className }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-2", className)}>
      {(title || aside) && (
        <div className="flex items-center justify-between gap-2">
          {title && <h2 className="m-0 text-counter font-semibold text-foreground">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-md border border-divider bg-card p-4", className)}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: ReactNode; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-md border border-divider bg-card px-3 py-2">
      <div className="text-caption text-muted-foreground">{label}</div>
      <div className="text-[24px] font-semibold leading-8 text-foreground">{value}</div>
      {hint && <div className="text-caption text-muted-foreground">{hint}</div>}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-muted text-primary",
  success: "bg-success-bg text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-xs px-1.5 py-0.5 text-caption", BADGE_TONES[tone])}>
      {children}
    </span>
  );
}

export function Loading() {
  const t = useTranslations("admin");
  return (
    <div className="flex justify-center py-12" aria-label={t("loading")}>
      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function LoadError({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations("admin");
  return (
    <div className="space-y-3 py-12 text-center">
      <p className="m-0 text-body text-muted-foreground">{t("loadFailed")}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="m-0 text-caption text-destructive">{children}</p>;
}

/**
 * A button that asks for a second tap («Точно?») instead of a native confirm dialog.
 * The armed state resets after a few seconds.
 */
export function ConfirmButton({ confirmLabel, onConfirm, children, ...props }: Omit<ButtonProps, "onClick"> & { confirmLabel?: ReactNode; onConfirm: () => void }) {
  const t = useTranslations("admin");
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);
  return (
    <Button
      {...props}
      onClick={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? confirmLabel ?? t("confirm") : children}
    </Button>
  );
}

/** Date (and time) in the UI locale; "—" for null. */
export function formatDate(iso: string | null | undefined, locale: string, withTime = false): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return withTime
    ? date.toLocaleString(locale, { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));
