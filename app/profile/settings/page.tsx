"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new settings location
    router.replace("/settings/profile");
  }, [router]);

  return (
    <div className="redirect-page">
      <div className="redirect-message">
        <h2>Redirecting...</h2>
        <p>Taking you to the new profile settings page.</p>
      </div>
    </div>
  );
} 