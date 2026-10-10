"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/models/types";
import { useCachedApi } from "@/lib/apiCache";

/**
 * `/` (app launch): onboarding (`/profile`) until the questionnaire is complete, then the «Встречи»
 * tab. A cached complete profile redirects at once; otherwise we wait for the server's answer,
 * so a stale "incomplete" copy never sends a finished user back into the wizard.
 */
export default function Home() {
  const router = useRouter();
  const { data, error, refreshing } = useCachedApi<Profile>("/api/profile", { allowNotFound: true });

  useEffect(() => {
    if (data?.isComplete) router.replace("/meetings");
    else if (refreshing) return;
    // Unknown (request failed, no cache): the «Встречи» tab, which reports the error itself.
    else if (error && data === undefined) router.replace("/meetings");
    else router.replace("/profile");
  }, [data, error, refreshing, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
