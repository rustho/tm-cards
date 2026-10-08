"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ProfileTheme } from "@/models/types";
import { ptMono } from "../fonts";
import type { ProfileTemplateProps } from "../types";
import { getAge, splitInterests } from "../utils";

/*
 * Every card design is a finished 1125×2000 artwork in public/profile-templates/<id>.webp
 * with the field labels ("Имя:", "Возраст:", …) and the empty photo window
 * already drawn. The answers are laid over it at fixed spots measured in the
 * artwork's pixels, so all sizes scale with the card width (cqw units).
 * Text boxes avoid the stickers on each design; they are shared by all designs.
 */

const W = 1125;
const H = 2000;

/** A box in artwork pixels → absolute position in percent. */
function box(x1: number, y1: number, x2: number, y2: number): CSSProperties {
  return {
    left: `${(x1 / W) * 100}%`,
    top: `${(y1 / H) * 100}%`,
    width: `${((x2 - x1) / W) * 100}%`,
    height: `${((y2 - y1) / H) * 100}%`,
  };
}

/** Font size in artwork pixels → container width units. */
const px = (n: number) => `${(n / W) * 100}cqw`;

const PHOTO = box(612, 95, 1072, 510);

const FIELDS = {
  name: box(215, 222, 575, 340),
  age: box(300, 357, 575, 420),
  occupation: box(108, 548, 800, 712),
  values: box(108, 778, 800, 905),
  talk: box(108, 972, 880, 1095),
  hobbies: box(108, 1165, 840, 1300),
  about: box(340, 1405, 1055, 1765),
} as const;

/** Per-design tweaks: the plane (sky) and "The Scream" (art) sit right of "Имя:". */
const NAME_FIELD: Partial<Record<ProfileTheme, { style: CSSProperties; size: number }>> = {
  sky: { style: box(215, 226, 455, 340), size: 38 },
  art: { style: box(215, 222, 470, 340), size: 46 },
};

/** The surf design has "about" over a busy sea photo. */
const ABOUT_BACKING: Partial<Record<ProfileTheme, string>> = {
  retro: "bg-white/70 p-[1.5%]",
};

function Field({
  style,
  size,
  lines,
  className,
  children,
}: {
  style: CSSProperties;
  size: number;
  /** Max lines; text beyond is cut with an ellipsis. */
  lines: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("absolute overflow-hidden", className)} style={style}>
      <p
        className="m-0 w-full break-words text-[#1b1b1b]"
        style={{
          fontSize: px(size),
          lineHeight: 1.25,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: lines,
          overflow: "hidden",
          whiteSpace: lines > 1 ? "pre-line" : undefined,
        }}
      >
        {children}
      </p>
    </div>
  );
}

export function ImageTemplate({ theme, profile, className }: ProfileTemplateProps & { theme: ProfileTheme }) {
  const age = getAge(profile);
  const values = profile.values ?? [];
  const { talk, hobbies } = splitInterests(profile);

  return (
    <article
      className={cn(ptMono.className, "relative w-full overflow-hidden", className)}
      style={{ aspectRatio: `${W} / ${H}`, containerType: "inline-size" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static artwork, fills the card */}
      <img src={`/profile-templates/${theme}.webp`} alt="" className="absolute inset-0 size-full select-none" draggable={false} />

      {profile.photo && (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs
        <img src={profile.photo} alt={profile.name ?? ""} className="absolute object-cover" style={PHOTO} />
      )}

      {profile.name && (
        <Field style={NAME_FIELD[theme]?.style ?? FIELDS.name} size={NAME_FIELD[theme]?.size ?? 46} lines={2}>
          {profile.name}
        </Field>
      )}
      {age !== null && (
        <Field style={FIELDS.age} size={46} lines={1}>
          {age}
        </Field>
      )}
      {profile.occupation && (
        <Field style={FIELDS.occupation} size={38} lines={3}>
          {profile.occupation}
        </Field>
      )}
      {values.length > 0 && (
        <Field style={FIELDS.values} size={38} lines={2}>
          {values.join(", ")}
        </Field>
      )}
      {talk.length > 0 && (
        <Field style={FIELDS.talk} size={38} lines={2}>
          {talk.join(", ")}
        </Field>
      )}
      {hobbies.length > 0 && (
        <Field style={FIELDS.hobbies} size={38} lines={2}>
          {hobbies.join(", ")}
        </Field>
      )}
      {profile.profile && (
        <Field style={FIELDS.about} size={36} lines={7} className={cn("rounded-sm", ABOUT_BACKING[theme])}>
          {profile.profile}
        </Field>
      )}
    </article>
  );
}
