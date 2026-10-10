"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCachedApi } from "@/lib/apiCache";
import { AdminPage, LoadError, Loading, Panel, Section, Stat, formatDate } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";
import {
  FUNNEL_PERIODS,
  FUNNEL_SOURCES,
  FUNNEL_STEPS,
  ONBOARDING_STEP_IDS,
  type FunnelDto,
  type FunnelPeriod,
  type FunnelSource,
} from "@/models/admin";

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** `/admin/funnel`: sign-up → questionnaire → pair → meeting → subscription, wizard drop-off, weekly cohorts. */
export default function AdminFunnel() {
  const t = useTranslations("admin.funnel");
  const locale = useLocale();
  const [period, setPeriod] = useState<FunnelPeriod>("30");
  const [source, setSource] = useState<FunnelSource>("all");
  const { data, error, refresh } = useCachedApi<FunnelDto>(`/api/admin/funnel?period=${period}&source=${source}`);

  return (
    <AdminPage title={t("title")}>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Chips label={t("period")} value={period} options={FUNNEL_PERIODS} onChange={setPeriod} text={(id) => t(`periods.${id}`)} />
        <Chips label={t("source")} value={source} options={FUNNEL_SOURCES} onChange={setSource} text={(id) => t(`sources.${id}`)} />
      </div>

      {!data ? (
        error ? <LoadError onRetry={refresh} /> : <Loading />
      ) : data.totals.users === 0 ? (
        <p className="m-0 py-12 text-center text-body text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Stat label={t("kpi.users")} value={data.totals.users} hint={t("kpi.referred", { count: data.totals.referred })} />
            <Stat label={t("kpi.completed")} value={`${pct(data.totals.completed, data.totals.users)}%`} hint={t("kpi.median", { time: formatHours(data.medianHoursToComplete, t) })} />
            <Stat label={t("kpi.mutual")} value={`${pct(data.totals.mutual, data.totals.matched)}%`} hint={t("kpi.ofMatched")} />
            <Stat label={t("kpi.met")} value={`${pct(data.totals.met, data.totals.mutual)}%`} hint={t("kpi.ofMutual")} />
            <Stat label={t("kpi.feedback")} value={data.totals.feedback} hint={t("kpi.feedbackHint", { pct: pct(data.totals.feedback, data.totals.matched) })} />
          </div>

          <Section title={t("funnelTitle")}>
            <Panel>
              <Bars
                rows={FUNNEL_STEPS.map((step) => ({ key: step, label: t(`steps.${step}`), value: data.totals[step] }))}
                base={data.totals.users}
              />
              <p className="m-0 mt-3 text-caption text-muted-foreground">{t("funnelHint")}</p>
            </Panel>
          </Section>

          <Section title={t("wizardTitle")}>
            <Panel>
              {!data.wizard.since || data.wizard.users === 0 ? (
                <p className="m-0 text-body text-muted-foreground">{t("wizardEmpty")}</p>
              ) : (
                <>
                  <Bars
                    rows={[
                      { key: "_users", label: t("wizardStart"), value: data.wizard.users },
                      ...orderSteps(data.wizard.steps).map(({ step, users }) => ({
                        key: step,
                        label: t.has(`wizard.${step}`) ? t(`wizard.${step}`) : step,
                        value: users,
                      })),
                    ]}
                    base={data.wizard.users}
                  />
                  <p className="m-0 mt-3 text-caption text-muted-foreground">
                    {t("wizardHint", { date: formatDate(data.wizard.since, locale) })}
                  </p>
                </>
              )}
            </Panel>
          </Section>

          <Section title={t("cohortsTitle")}>
            <CohortTable data={data} />
          </Section>
        </>
      )}
    </AdminPage>
  );
}

function Chips<T extends string>({ label, value, options, onChange, text }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void; text: (v: T) => string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      {options.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={cn(
            "rounded-full border px-3 py-1 text-chip transition-colors",
            value === id ? "border-primary bg-primary-muted text-primary" : "border-divider bg-card text-muted-foreground"
          )}
        >
          {text(id)}
        </button>
      ))}
    </div>
  );
}

/**
 * Horizontal funnel bars, one hue: width = share of the first row. Labels carry the
 * numbers (count, % of start, conversion from the previous step); the row title repeats them on hover.
 */
function Bars({ rows, base }: { rows: { key: string; label: string; value: number }[]; base: number }) {
  const t = useTranslations("admin.funnel");
  return (
    <ul className="m-0 list-none space-y-2.5 p-0">
      {rows.map((row, i) => {
        const ofBase = pct(row.value, base);
        const fromPrev = i > 0 ? pct(row.value, rows[i - 1].value) : null;
        const title = `${row.label}: ${row.value} · ${ofBase}%${fromPrev !== null ? ` · ${t("fromPrev", { pct: fromPrev })}` : ""}`;
        return (
          <li key={row.key} title={title} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-body">
              <span className="min-w-0 truncate text-foreground">{row.label}</span>
              <span className="shrink-0 tabular-nums text-foreground">
                {row.value}
                <span className="ml-1.5 text-caption text-muted-foreground">
                  {ofBase}%{fromPrev !== null && ` · ${t("fromPrev", { pct: fromPrev })}`}
                </span>
              </span>
            </div>
            <div className="h-2 rounded-r-[4px] bg-muted">
              <div className="h-full rounded-r-[4px] bg-primary" style={{ width: `${Math.min(100, Math.max(ofBase, row.value > 0 ? 1 : 0))}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Weekly sign-up cohorts: counts and conversion from sign-up, newest week first. */
function CohortTable({ data }: { data: FunnelDto }) {
  const t = useTranslations("admin.funnel");
  const columns = ["completed", "matched", "mutual", "met", "subscribed"] as const;
  return (
    <div className="overflow-x-auto rounded-md border border-divider bg-card">
      <table className="w-full border-collapse text-body">
        <thead>
          <tr className="text-left text-caption text-muted-foreground">
            <th className="px-3 py-2 font-normal">{t("cohortWeek")}</th>
            <th className="px-3 py-2 text-right font-normal">{t("steps.users")}</th>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 text-right font-normal">{t(`steps.${c}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.weeks.map((w) => (
            <tr key={w.week} className="border-t border-divider">
              <td className="whitespace-nowrap px-3 py-2 text-foreground">{w.week}</td>
              <td className="px-3 py-2 text-right tabular-nums text-foreground">{w.users}</td>
              {columns.map((c) => (
                <td key={c} className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-foreground">
                  {w[c]} <span className="text-caption text-muted-foreground">{pct(w[c], w.users)}%</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Wizard steps in wizard order; unknown ids (renamed steps) go last. */
function orderSteps(steps: FunnelDto["wizard"]["steps"]) {
  const index = (id: string) => {
    const i = (ONBOARDING_STEP_IDS as readonly string[]).indexOf(id);
    return i === -1 ? ONBOARDING_STEP_IDS.length : i;
  };
  return [...steps].sort((a, b) => index(a.step) - index(b.step));
}

function formatHours(hours: number | null, t: (key: "units.min" | "units.h" | "units.d", values: { n: number }) => string): string {
  if (hours === null) return "—";
  if (hours < 1) return t("units.min", { n: Math.max(1, Math.round(hours * 60)) });
  if (hours < 48) return t("units.h", { n: Math.round(hours) });
  return t("units.d", { n: Math.round(hours / 24) });
}
