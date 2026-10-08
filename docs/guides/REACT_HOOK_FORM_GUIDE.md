# React Hook Form Integration Guide

## Overview

The wizard now uses **react-hook-form** for form state management. This provides:
- ✅ Better performance (fewer re-renders)
- ✅ Built-in validation
- ✅ Automatic reactivity between steps
- ✅ `watch()` to react to field changes
- ✅ No prop drilling needed

## Key Benefits

### 1. Every step sees what earlier steps wrote

```typescript
// StepLocation.tsx: one card writes two fields
const { watch, setValue } = useWizardContext();
setValue("country", location.country, { shouldDirty: true });
setValue("region", location.region, { shouldDirty: true });

// Any later step (or the autosave in Wizard.tsx) reads them reactively
const country = watch("country"); // "Сербия"
```

### 2. No prop drilling

Steps can access any field from the form without passing props:

```typescript
const { watch } = useWizardContext();
const name = watch("name");
const country = watch("country");
const interests = watch("interests");
// Access any field!
```

## Usage Patterns

### Basic Text Input

```typescript
import { useWizardContext } from "../WizardContext";

export function StepName({ onNext }: StepProps) {
  const { register, watch, formState: { errors } } = useWizardContext();
  const name = watch("name") || "";

  return (
    <StepWindow title="Name" onNext={onNext} nextDisabled={name.trim().length < 2}>
      <TextInput
        {...register("name", {
          required: true,
          validate: (v) => (v ?? "").trim().length >= 2 || "At least 2 characters",
        })}
        error={Boolean(errors.name)}
      />
      {errors.name && <p className="m-0 text-caption text-destructive">{errors.name.message}</p>}
    </StepWindow>
  );
}
```

### Watching and Setting Several Fields

```typescript
// StepLocation: country + region come from one LocationOption
export function StepLocation({ onNext }: StepProps) {
  const { watch, setValue } = useWizardContext();

  const country = watch("country") || "";
  const region = watch("region") || "";
  const selected = AVAILABLE.find((l) => l.country === country && l.region === region);

  return (
    <StepWindow title="Location" onNext={onNext} nextDisabled={!selected}>
      {AVAILABLE.map((location) => (
        <CountryCard
          key={location.label}
          label={location.label}
          state={location === selected ? "selected" : "default"}
          onClick={() => {
            setValue("country", location.country, { shouldDirty: true });
            setValue("region", location.region, { shouldDirty: true });
          }}
        />
      ))}
    </StepWindow>
  );
}
```

### Array Fields (Multi-Select)

`useLimitedSelection(field, max)` (`app/profile/ui/useLimitedSelection.ts`)
wraps `watch` + `setValue` for any `string[]` field of `Profile`:

```typescript
export function StepValues({ onNext }: StepProps) {
  const { count, isSelected, isLocked, toggle } = useLimitedSelection("values", MAX_VALUES);

  return (
    <StepWindow title="Values" onNext={onNext} nextDisabled={count === 0}>
      {VALUE_OPTIONS.map(({ label, emoji }) => (
        <ListItem
          key={label}
          label={label}
          icon={emoji}
          selected={isSelected(label)}
          disabled={isLocked(label)} // locked once MAX_VALUES are picked
          onClick={() => toggle(label)}
        />
      ))}
    </StepWindow>
  );
}
```

## API Reference

### `useWizardContext()`

Returns react-hook-form's `UseFormReturn` plus wizard-specific methods:

```typescript
{
  // React Hook Form methods
  register: (name, options) => {...}  // Register input
  watch: (name?) => value              // Watch field(s)
  setValue: (name, value, options)    // Set field value
  getValues: () => formData            // Get all values
  formState: { errors, isValid, ... } // Form state
  
  // Wizard-specific
  currentStepIndex: number
  goToNextStep: () => void
  goToPreviousStep: () => void
}
```

### Common Patterns

#### Register an input
```typescript
<TextInput {...register("name", { required: true })} />
```

#### Watch a field
```typescript
const name = watch("name");
```

#### Watch multiple fields
```typescript
const [name, country, region] = watch(["name", "country", "region"]);
```

#### Set a value
```typescript
setValue("country", "Сербия", { shouldDirty: true });
```

#### Get all values
```typescript
const allData = getValues();
```

## Migration from Old Pattern

### Old Pattern (Props-based)
```typescript
export function StepName({ data, onUpdate, onNext }: StepProps) {
  const name = data.name || "";
  const handleChange = (e) => onUpdate({ name: e.target.value });
  
  return <input value={name} onChange={handleChange} />;
}
```

### New Pattern (React Hook Form)
```typescript
export function StepName({ onNext }: StepProps) {
  const { register, watch } = useWizardContext();
  const name = watch("name") || "";
  
  return <TextInput {...register("name")} />;
}
```

## No Backward Compatibility

The old prop-based pattern is gone: `StepProps` is just `{ onNext }` and
`FlexibleWizard` passes only `onNext` plus the step's optional `props` from
`wizardConfig.ts`. All state goes through `useWizardContext()`.

## Example: Complete Step

```typescript
"use client";

import { useTranslations } from "next-intl";
import { TextInput } from "@/components/ui";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

export function StepName({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.name");
  const { register, watch, formState: { errors } } = useWizardContext();

  const name = watch("name") || "";
  const valid = name.trim().length >= 2;

  return (
    <StepWindow title={t("title")} onNext={onNext} nextDisabled={!valid}>
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onNext();
        }}
      >
        <TextInput
          {...register("name", {
            required: true,
            validate: (value) => (value ?? "").trim().length >= 2 || t("error"),
          })}
          placeholder={t("placeholder")}
          maxLength={50}
          autoComplete="given-name"
          enterKeyHint="next"
          autoFocus
          error={Boolean(errors.name)}
        />
        {errors.name && (
          <p className="m-0 px-1 text-caption text-destructive">{errors.name.message || t("error")}</p>
        )}
      </form>
    </StepWindow>
  );
}
```

