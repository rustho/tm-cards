"use client";

import { useEffect, useState } from "react";

/** Milliseconds left until `deadline` (ISO), ticking every second; never below 0. */
export function useCountdown(deadline: string): number {
  const target = new Date(deadline).getTime();
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return left;
}

/** Splits milliseconds into whole days, hours, minutes and seconds. */
export function splitDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
