"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EDIT_STEPS, Wizard } from "../../ui/Wizard";

/**
 * One questionnaire step of a finished profile (from /profile/edit or the «Локация» row in the
 * «Профиль» menu). «Далее» saves only what changed, «Назад» discards; both return where the user came from.
 */
export default function EditProfileStepPage({ params }: { params: { step: string } }) {
  const router = useRouter();
  const known = EDIT_STEPS.some((s) => s.id === params.step);

  useEffect(() => {
    if (!known) router.replace("/profile/edit");
  }, [known, router]);

  if (!known) return null;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden px-4 pb-4">
      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col">
        <Wizard editStep={params.step} onDone={() => router.back()} onCancel={() => router.back()} />
      </div>
    </div>
  );
}
