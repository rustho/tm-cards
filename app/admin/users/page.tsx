"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { useCachedApi } from "@/lib/apiCache";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { AdminPage, LoadError, Loading, formatDate } from "@/components/admin/AdminUI";
import { UserBadges } from "@/components/admin/UserBadges";
import { cn } from "@/lib/utils";
import { USER_FILTERS, type AdminUserList, type UserFilter } from "@/models/admin";

/** `/admin/users`: search by name / @username / Telegram id, filters, 50 per page. */
export default function AdminUsers() {
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(input.trim());
      setOffset(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [input]);

  const url = `/api/admin/users?${new URLSearchParams({ q, filter, offset: String(offset) })}`;
  const { data, error, refresh } = useCachedApi<AdminUserList>(url);

  return (
    <AdminPage title={t("title")}>
      <TextInput value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("search")} inputMode="search" />
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {USER_FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setFilter(id);
              setOffset(0);
            }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-chip transition-colors",
              filter === id ? "border-primary bg-primary-muted text-primary" : "border-divider bg-card text-muted-foreground"
            )}
          >
            {t(`filters.${id}`)}
          </button>
        ))}
      </div>

      {!data ? (
        error ? <LoadError onRetry={refresh} /> : <Loading />
      ) : data.users.length === 0 ? (
        <p className="m-0 py-12 text-center text-body text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          <p className="m-0 text-caption text-muted-foreground">{t("found", { count: data.total })}</p>
          <ul className="m-0 list-none divide-y divide-divider overflow-hidden rounded-md border border-divider bg-card p-0">
            {data.users.map((user) => (
              <li key={user.telegramId}>
                <Link href={`/admin/users/${user.telegramId}`} className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60">
                  <Avatar name={user.name} photo={user.photo} className="size-10 text-caption" />
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block truncate text-body font-medium text-foreground">
                      {user.name}
                      {user.username && <span className="font-normal text-muted-foreground"> @{user.username}</span>}
                    </span>
                    <UserBadges user={user} />
                    <span className="block text-caption text-muted-foreground">
                      {[user.place, t("joined", { date: formatDate(user.createdAt, locale) }), user.lastSeenAt && t("seen", { date: formatDate(user.lastSeenAt, locale) })]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
          {data.total > data.limit && (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - data.limit))}>
                {t("prev")}
              </Button>
              <span className="text-caption text-muted-foreground">
                {offset + 1}–{Math.min(offset + data.limit, data.total)} / {data.total}
              </span>
              <Button variant="outline" size="sm" disabled={offset + data.limit >= data.total} onClick={() => setOffset(offset + data.limit)}>
                {t("next")}
              </Button>
            </div>
          )}
        </>
      )}
    </AdminPage>
  );
}
