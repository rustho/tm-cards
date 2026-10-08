"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { pressStart, ptMono } from "../fonts";
import type { ProfileTemplateProps } from "../types";
import { getAge } from "../utils";

/*
 * "Ретро": scrapbook in pixel/typewriter style. Torn beige paper with the
 * TravelMate logo, a stack of photo frames, a mint sheet with the answers,
 * "about" over a sea strip. Template art uses its own fixed palette on purpose.
 */

const GRID_BG = {
  backgroundColor: "#fbfbfb",
  backgroundImage:
    "linear-gradient(#d4d4d4 1px, transparent 1px), linear-gradient(90deg, #d4d4d4 1px, transparent 1px)",
  backgroundSize: "22px 22px",
} as const;

/** Jagged bottom edge for "torn" paper. */
const TORN_BOTTOM =
  "polygon(0 0, 100% 0, 100% 92%, 94% 96%, 87% 91%, 79% 97%, 71% 92%, 62% 98%, 54% 92%, 45% 97%, 37% 91%, 28% 96%, 19% 91%, 10% 97%, 0 92%)";
const TORN_TOP =
  "polygon(0 6%, 8% 2%, 17% 7%, 26% 1%, 35% 6%, 44% 2%, 53% 8%, 62% 2%, 71% 7%, 80% 1%, 89% 6%, 100% 2%, 100% 100%, 0 100%)";

function Label({ children }: { children: React.ReactNode }) {
  return <span className={cn(pressStart.className, "text-[10px] leading-4 text-[#1b1b1b]")}>{children}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <Label>{label}:</Label>
      <div className="text-[14px] leading-[19px] text-[#1b1b1b]">{children}</div>
    </section>
  );
}

function PhotoStack({ src, alt, placeholder }: { src?: string; alt: string; placeholder: string }) {
  return (
    <div className="relative">
      {[2, 1].map((n) => (
        <div
          key={n}
          aria-hidden
          className="absolute h-full w-full border border-[#8c8c8c] bg-white"
          style={{ top: -n * 4, left: -n * 4 }}
        />
      ))}
      <div className="relative border border-[#6b6b6b] bg-white">
        <div aria-hidden className="flex h-3 items-center gap-1 border-b border-[#6b6b6b] bg-[#e9e9e9] px-1 text-[7px] leading-none">
          <span>✕</span>
          <span>▢</span>
          <span>▁</span>
        </div>
        <div className="aspect-square w-full bg-white">
          {src && (
            // eslint-disable-next-line @next/next/no-img-element -- data URLs
            <img src={src} alt={alt} className="size-full object-cover" />
          )}
        </div>
      </div>
      {!src && <div className={cn(pressStart.className, "mt-1 text-right text-[7px] text-[#1b1b1b]")}>{placeholder}</div>}
    </div>
  );
}

export function RetroTemplate({ profile, className }: ProfileTemplateProps) {
  const t = useTranslations("profileCard");
  const age = getAge(profile);
  const values = profile.values ?? [];
  const interests = profile.interests ?? [];
  const formats = profile.meetingFormats ?? [];

  return (
    <article className={cn(ptMono.className, "relative overflow-hidden pb-6 text-[#1b1b1b]", className)} style={GRID_BG}>
      {/* beige torn paper with logo, name and age */}
      <div
        className="relative bg-[#e8e1d3] px-5 pb-12 pt-5"
        style={{ clipPath: TORN_BOTTOM, backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)", backgroundSize: "5px 5px" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div aria-hidden className={cn(pressStart.className, "text-[13px] leading-5")}>
              TRAVEL🌴
              <br />
              MATE
            </div>
            <div className="mt-6 flex flex-col gap-4 text-[14px]">
              <div>
                <Label>{t("name")}:</Label> {profile.name || "—"}
              </div>
              {age !== null && (
                <div>
                  <Label>{t("age")}:</Label> {age}
                </div>
              )}
            </div>
          </div>
          <div className="relative mr-[-4px] mt-3 w-[46%] shrink-0">
            <span aria-hidden className="absolute -left-7 -top-6 z-10 rotate-[-20deg] text-[34px]">📎</span>
            <PhotoStack src={profile.photo} alt={profile.name ?? ""} placeholder={t("photoPlaceholder")} />
          </div>
        </div>
      </div>

      {/* mint sheet with answers */}
      <div className="relative -mt-6 ml-4 mr-6 bg-[#d6e2c4] px-4 pb-8 pt-7 shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
        <span aria-hidden className="absolute -left-5 -top-6 text-[38px] leading-none">🌟</span>
        <span aria-hidden className="absolute -right-5 top-1/3 text-[30px] text-[#3f8f73]">✳</span>
        <div className="flex flex-col gap-5">
          {profile.occupation && <Field label={t("occupation")}>{profile.occupation}</Field>}
          {values.length > 0 && <Field label={t("values")}>{values.join(", ")}</Field>}
          {interests.length > 0 && <Field label={t("interests")}>{interests.join(", ")}</Field>}
          {formats.length > 0 && <Field label={t("meetingFormats")}>{formats.join(", ")}</Field>}
        </div>
        <span aria-hidden className="absolute -bottom-4 right-2 text-[34px]">🤙</span>
      </div>

      {/* about over a sea strip */}
      {profile.profile && (
        <div
          className="relative mt-4 px-4 pb-8 pt-10"
          style={{
            clipPath: TORN_TOP,
            background:
              "linear-gradient(180deg, #a9d3e6 0%, #6fb1d1 45%, #3d86b0 100%)",
          }}
        >
          <div className="ml-10 bg-[#f4f1ea]/90 px-4 pb-4 pt-3 shadow-sm">
            <div className="mb-2">
              <Label>{t("about")}…</Label>
            </div>
            <div className="whitespace-pre-line text-[13px] leading-[18px]">{profile.profile}</div>
          </div>
        </div>
      )}
    </article>
  );
}
