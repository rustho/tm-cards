"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Old link target: the questionnaire editor now lives at /profile/edit. */
export default function ProfileSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/edit");
  }, [router]);

  return null;
}
