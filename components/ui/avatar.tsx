import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Round photo with an initials fallback (primary-muted fill, primary text).
 * Size comes from `className` (e.g. `size-14`); default 48px.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  photo?: string;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(({ className, name, photo, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-muted font-semibold text-primary",
      className
    )}
    {...props}
  >
    {photo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt={name} className="size-full object-cover" />
    ) : (
      <span aria-label={name}>{initials(name)}</span>
    )}
  </span>
));
Avatar.displayName = "Avatar";

/** Overlapping row of avatars; each ringed with the card color. */
export interface AvatarStackProps extends React.HTMLAttributes<HTMLDivElement> {
  people: { id: string; name: string; photo?: string }[];
  avatarClassName?: string;
}

const AvatarStack = ({ people, className, avatarClassName, ...props }: AvatarStackProps) => (
  <div className={cn("flex", className)} {...props}>
    {people.map((person, i) => (
      <Avatar
        key={person.id}
        name={person.name}
        photo={person.photo}
        className={cn("ring-2 ring-card", i > 0 && "-ml-3", avatarClassName)}
      />
    ))}
  </div>
);

export { Avatar, AvatarStack };
