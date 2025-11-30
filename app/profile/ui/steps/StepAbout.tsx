"use client";

import { Input, StepContainer } from "@/components";
import { Profile, StepProps } from "@/models/types";

export interface StepAboutProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}
const MAX_CHARS = 284;

export function StepAbout({
  data,
  onUpdate,
  onNext,
}: StepAboutProps) {
  const about = data.profile || ""; // Assuming 'profile' field maps to About/Bio as per earlier finding. Or use 'about' alias if we set it.

  // Note: Model has `profile` as the string field for bio/about.
  // And `ProfileData` type aliases it as `about`.
  // Let's use `profile` key for updates to be consistent with Profile type.

  return (
    <StepContainer
      title="Расскажи самое важное и интересное о себе в свободной форме."
      onNext={onNext}
      nextDisabled={!about.trim()}
    >
      <Input
        type="text" // Or textarea if supported, but Input usually implies text input
        value={about}
        onChange={(e) => onUpdate({ profile: e.target.value.slice(0, MAX_CHARS) })}
        placeholder="Расскажите о себе..."
        maxLength={MAX_CHARS}
        required
      />
      <div className="character-count">
        {about.length}/{MAX_CHARS}
      </div>
    </StepContainer>
  );
}
