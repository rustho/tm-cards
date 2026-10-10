"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useCachedApi } from "@/lib/apiCache";
import { AdminPage, ErrorText, LoadError, Loading, Stat, errorMessage } from "@/components/admin/AdminUI";
import { MatchCard } from "@/components/admin/MatchCard";
import type { AdminRoundDetails } from "@/models/admin";

/** `/admin/matching/[roundId]`: every pair of a round; open pairs can be cancelled. */
export default function AdminRound({ params }: { params: { roundId: string } }) {
  const t = useTranslations("admin.matching");
  const { data, error, refresh, mutate } = useCachedApi<AdminRoundDetails>(`/api/admin/matching/rounds/${params.roundId}`);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const cancel = async (matchId: string) => {
    setBusy(matchId);
    setActionError(null);
    try {
      mutate(await api.post<AdminRoundDetails>(`/api/admin/matching/matches/${matchId}`, { action: "cancel" }));
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminPage title={data ? t("week", { date: data.weekStart }) : t("round")}>
      {!data ? (
        error ? <LoadError onRetry={refresh} /> : <Loading />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={t("pairs")} value={data.pairs} />
            <Stat label={t("mutual")} value={data.mutual} />
            <Stat label={t("met")} value={data.met} />
            <Stat label={t("notMet")} value={data.notMet} />
          </div>
          <ErrorText>{actionError}</ErrorText>
          <div className="space-y-2">
            {data.matches.map((m) => (
              <MatchCard key={m.matchId} match={m} onCancel={() => cancel(m.matchId)} busy={busy === m.matchId} />
            ))}
          </div>
        </>
      )}
    </AdminPage>
  );
}
