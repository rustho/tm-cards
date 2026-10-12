"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { TextInput } from "@/components/ui/text-input";
import { UserBadges } from "@/components/admin/UserBadges";
import type { AdminUserList, AdminUserRow } from "@/models/admin";

/** Search-as-you-type over /api/admin/users; shows the picked user as a removable chip. */
export function UserPicker({ value, onChange, placeholder }: { value: AdminUserRow | null; onChange: (user: AdminUserRow | null) => void; placeholder?: string }) {
  const t = useTranslations("admin.picker");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<AdminUserRow[] | null>(null);

  useEffect(() => {
    const query = q.trim();
    if (!query) return setResults(null);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const list = await api.get<AdminUserList>(`/api/admin/users?${new URLSearchParams({ q: query, filter: "complete" })}`);
        if (!cancelled) setResults(list.users.slice(0, 6));
      } catch {
        if (!cancelled) setResults([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-primary bg-primary-muted px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-body text-foreground">
          {value.name}
          {value.place && <span className="text-caption text-muted-foreground"> · {value.place}</span>}
        </span>
        <button type="button" aria-label={t("clear")} className="text-muted-foreground hover:text-foreground" onClick={() => onChange(null)}>
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder ?? t("placeholder")} />
      {results && (
        <ul className="m-0 list-none divide-y divide-divider overflow-hidden rounded-md border border-divider bg-card p-0">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-caption text-muted-foreground">{t("nothing")}</li>
          ) : (
            results.map((user) => (
              <li key={user.telegramId}>
                <button
                  type="button"
                  className="block w-full space-y-1 px-3 py-2 text-left transition-colors hover:bg-muted/60"
                  onClick={() => {
                    onChange(user);
                    setQ("");
                  }}
                >
                  <span className="block text-body text-foreground">
                    {user.name}
                    {user.place && <span className="text-caption text-muted-foreground"> · {user.place}</span>}
                  </span>
                  <UserBadges user={user} />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
