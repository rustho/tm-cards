"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { caveat } from "../fonts";
import type { ProfileTemplateProps } from "../types";
import { formatLocation } from "../utils";

/*
 * "Блокнот": a grey paper sheet taped onto grid paper, the photo in a tiny
 * retro window, sections in bold sans, "about" on a pinned note.
 * Template art uses its own fixed palette (not app theme tokens) on purpose.
 */

const GRID_BG = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "linear-gradient(#dcdcdc 1px, transparent 1px), linear-gradient(90deg, #dcdcdc 1px, transparent 1px)",
  backgroundSize: "28px 28px",
} as const;

const PAPER_BG = {
  backgroundColor: "#c9c9c9",
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)",
  backgroundSize: "7px 7px, 11px 11px",
  backgroundPosition: "0 0, 3px 4px",
} as const;

function PhotoWindow({ src, alt, placeholder }: { src?: string; alt: string; placeholder: string }) {
  return (
    <div className="relative w-full">
      {/* stacked frame behind */}
      <div aria-hidden className="absolute -right-1.5 -top-1.5 h-full w-full border border-[#9a9a9a] bg-white" />
      <div className="relative border border-[#7d7d7d] bg-white shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
        <div
          aria-hidden
          className="flex h-3.5 items-center gap-1 border-b border-[#7d7d7d] bg-[#e4e4e4] px-1.5 text-[8px] leading-none text-[#555]"
        >
          <span>✕</span>
          <span>▢</span>
          <span>▁</span>
        </div>
        <div className="aspect-[4/5] w-full bg-white">
          {src && (
            // eslint-disable-next-line @next/next/no-img-element -- data URLs
            <img src={src} alt={alt} className="size-full object-cover" />
          )}
        </div>
      </div>
      {!src && <div className="mt-1 text-right text-[11px] font-bold text-[#111]">{placeholder}</div>}
    </div>
  );
}

function CodeSticker({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-[112px] rotate-3 rounded-md border-2 border-white bg-[#1d1d1f] p-2 font-mono text-[8px] leading-[11px] shadow-md",
        className
      )}
    >
      <div className="mb-1 flex gap-1">
        <span className="size-1.5 rounded-full bg-[#ff5f57]" />
        <span className="size-1.5 rounded-full bg-[#febc2e]" />
        <span className="size-1.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="text-white">First rule of programming:</div>
      <div className="text-[#6fd3ff]">If it works,</div>
      <div className="text-[#ff7a90]">don&apos;t touch it.</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <div className="text-[19px] font-bold leading-6 text-[#111]">{title}:</div>
      <div className="text-[13px] leading-[17px] text-[#2b2b2b]">{children}</div>
    </section>
  );
}

export function NotebookTemplate({ profile, className }: ProfileTemplateProps) {
  const t = useTranslations("profileCard");
  const location = formatLocation(profile, ". ");
  const values = profile.values ?? [];
  const interests = profile.interests ?? [];

  return (
    <article className={cn("relative overflow-hidden px-3 pb-10 pt-6 text-[#111]", className)} style={GRID_BG}>
      {/* pink tape on the sheet's corner */}
      <div aria-hidden className="absolute left-0 top-4 z-20 h-10 w-20 -rotate-12 bg-[#f2c4cc]/80 shadow-sm" />

      <div
        className="relative mt-8 -rotate-[0.4deg] px-5 pb-6 pt-6 shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
        style={PAPER_BG}
      >
        <header className="flex items-start gap-3">
          <div className="min-w-0 flex-1 pt-10">
            <div className="break-words text-[28px] font-extrabold leading-8">{profile.name || "—"}</div>
            {location && <div className="mt-2 text-[12px] text-[#333]">📍{location}</div>}
          </div>
          <div className="-mr-8 -mt-12 w-[46%] shrink-0">
            <PhotoWindow src={profile.photo} alt={profile.name ?? ""} placeholder={t("photoPlaceholder")} />
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-6 pr-6">
          {profile.occupation && <Section title={t("occupation")}>{profile.occupation}</Section>}
          {values.length > 0 && <Section title={t("values")}>{values.join(" · ")}</Section>}
          {interests.length > 0 && (
            <Section title={t("interests")}>{interests.join(", ").toLowerCase()}</Section>
          )}
        </div>

        {/* sticks out of the sheet's right edge, below the text */}
        <CodeSticker className="-mr-9 ml-auto mt-6" />
      </div>

      {profile.profile && (
        <div className="relative -mt-4 ml-14 mr-2 rotate-[1.2deg] border border-[#bdbdbd] bg-[#ededed] px-4 pb-5 pt-4 shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
          <div aria-hidden className="absolute -left-12 -top-6 font-mono text-[22px] font-bold text-[#111]">
            &lt;/☕&gt;
          </div>
          <div className="mb-2 text-[16px] font-bold">{t("about")}</div>
          <div className="whitespace-pre-line text-[13px] leading-[18px] text-[#2b2b2b]">{profile.profile}</div>
          <div aria-hidden className={cn(caveat.className, "mt-3 text-right text-[18px] text-[#555]")}>
            ✎ {profile.name}
          </div>
        </div>
      )}
    </article>
  );
}
