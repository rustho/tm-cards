"use client";

import { type PropsWithChildren, useEffect, useState } from "react";
import {
  initData,
  miniApp,
  retrieveLaunchParams,
  useLaunchParams,
  useSignal,
} from "@tma.js/sdk-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorPage } from "@/components/ErrorPage";
import { setLocale } from "@/core/i18n/locale";
import { init } from "@/core/init";
import { mockEnv } from "@/core/mockEnv";
import { cn } from "@/lib/utils";

import "./styles.css";

function RootInner({ children }: PropsWithChildren) {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const user = useSignal(initData.user);

  // Drive Tailwind/shadcn dark mode from the Telegram theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (user?.language_code) {
      void setLocale(user.language_code);
    }
  }, [user]);

  const isIos = ["macos", "ios"].includes(lp.tgWebAppPlatform);

  return <div className={cn("app-root min-h-screen", isIos && "platform-ios")}>{children}</div>;
}

type Status = { kind: "loading" } | { kind: "ready" } | { kind: "error"; error: Error };

// Module-level so React StrictMode's double effect (and HMR) cannot run the
// SDK bootstrap twice; bindCssVars() throws on a second call.
let bootPromise: Promise<void> | null = null;

function boot(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      await mockEnv();
      const lp = retrieveLaunchParams();
      const debug =
        (lp.tgWebAppStartParam || "").includes("debug") || process.env.NODE_ENV === "development";
      await init({
        debug,
        eruda: debug && ["ios", "android"].includes(lp.tgWebAppPlatform),
        mockForMacOS: lp.tgWebAppPlatform === "macos",
      });
    })().catch((error) => {
      bootPromise = null; // allow a retry on the next mount
      throw error;
    });
  }
  return bootPromise;
}

/**
 * Client bootstrap. The SDK is browser-only, so the server renders a loader
 * and the real tree mounts after mockEnv() + init() have finished.
 */
export function Root({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    boot()
      .then(() => !cancelled && setStatus({ kind: "ready" }))
      .catch((error) => {
        console.error("Failed to initialize Telegram SDK:", error);
        if (!cancelled) {
          setStatus({ kind: "error", error: error instanceof Error ? error : new Error(String(error)) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.kind === "loading") {
    return <div className="root__loading">Loading</div>;
  }
  if (status.kind === "error") {
    return <ErrorPage error={status.error} />;
  }
  return (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner>{children}</RootInner>
    </ErrorBoundary>
  );
}
