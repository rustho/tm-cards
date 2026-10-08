"use client";

import { Profile } from "@/models/types";
import { useWizardContext } from "./WizardContext";

type ArrayField = {
  [K in keyof Profile]-?: NonNullable<Profile[K]> extends string[] ? K : never;
}[keyof Profile];

/**
 * Multi-select over a string[] profile field with an upper bound: toggling
 * adds or removes a value; once `max` is reached, unselected options are
 * locked (`isLocked`) until one is removed.
 */
export function useLimitedSelection(field: ArrayField, max: number) {
  const { watch, setValue } = useWizardContext();
  const selected: string[] = watch(field) || [];
  const limitReached = selected.length >= max;

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      setValue(field, selected.filter((v) => v !== value), { shouldDirty: true });
    } else if (!limitReached) {
      setValue(field, [...selected, value], { shouldDirty: true });
    }
  };

  return {
    selected,
    count: selected.length,
    isSelected: (value: string) => selected.includes(value),
    isLocked: (value: string) => limitReached && !selected.includes(value),
    toggle,
  };
}
