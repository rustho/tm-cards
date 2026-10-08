"use client";

import { useParams } from "next/navigation";
import { MeetingFeedbackFlow } from "@/components/meetings/MeetingFeedbackFlow";

/** One meeting from the «Люди» history: leave or read impressions. */
export default function MeetingPage() {
  const { matchId } = useParams<{ matchId: string }>();
  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pb-28 pt-4">
      <MeetingFeedbackFlow matchId={matchId} />
    </div>
  );
}
