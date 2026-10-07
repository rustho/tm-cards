# React Hook Form Integration Guide

## Overview

The wizard now uses **react-hook-form** for form state management. This provides:
- ✅ Better performance (fewer re-renders)
- ✅ Built-in validation
- ✅ Automatic reactivity between steps
- ✅ `watch()` to react to field changes
- ✅ No prop drilling needed

## Key Benefits

### 1. StepCity automatically reacts to StepCountry changes

```typescript
// StepCountry.tsx
const { register, setValue } = useWizardContext();
setValue("country", "USA"); // Updates form state

// StepCity.tsx - automatically receives the update!
const country = watch("country"); // "USA" - reactive!
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
    <StepContainer title="Name" onNext={onNext} nextDisabled={!name}>
      <Input
        {...register("name", {
          required: true,
          minLength: { value: 2, message: "Name must be at least 2 characters" }
        })}
      />
      {errors.name && <div>{errors.name.message}</div>}
    </StepContainer>
  );
}
```

### Watching Fields (Cross-Step Dependencies)

```typescript
// StepCity watches country from StepCountry
export function StepCity({ onNext }: StepProps) {
  const { watch, setValue, register } = useWizardContext();
  
  // Watch country field - automatically updates when StepCountry changes it!
  const country = watch("country");
  const region = watch("region") || "";

  // Reset region when country changes
  useEffect(() => {
    if (country && region) {
      const validRegions = getRegionsForCountry(country);
      if (!validRegions.includes(region)) {
        setValue("region", "");
      }
    }
  }, [country, region, setValue]);

  return (
    <Select
      {...register("region")}
      value={region}
      disabled={!country}
    >
      {/* options */}
    </Select>
  );
}
```

### Array Fields (Multi-Select)

```typescript
export function StepPersonality({ onNext }: StepProps) {
  const { watch, setValue } = useWizardContext();
  const traits = watch("personalityTraits") || [];

  const handleToggle = (trait: string) => {
    if (traits.includes(trait)) {
      setValue("personalityTraits", traits.filter(t => t !== trait));
    } else if (traits.length < 4) {
      setValue("personalityTraits", [...traits, trait]);
    }
  };

  return (
    <SelectionGrid>
      {TRAITS.map(trait => (
        <SelectedButton
          selected={traits.includes(trait)}
          onClick={() => handleToggle(trait)}
        >
          {trait}
        </SelectedButton>
      ))}
    </SelectionGrid>
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
<Input {...register("name", { required: true })} />
```

#### Watch a field
```typescript
const name = watch("name");
```

#### Watch multiple fields
```typescript
const { name, country, region } = watch(["name", "country", "region"]);
```

#### Set a value
```typescript
setValue("country", "USA", { shouldValidate: true });
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
  
  return <Input value={name} onChange={handleChange} />;
}
```

### New Pattern (React Hook Form)
```typescript
export function StepName({ onNext }: StepProps) {
  const { register, watch } = useWizardContext();
  const name = watch("name") || "";
  
  return <Input {...register("name")} />;
}
```

## Backward Compatibility

The wizard still supports the old prop-based pattern for existing steps:
- `data` prop is still passed (contains current form values)
- `onUpdate` prop still works (updates form state)

But new steps should use react-hook-form directly for better performance and reactivity.

## Example: Complete Step

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

export function StepName({ onNext }: StepProps) {
  const t = useTranslations('profile.steps.name');
  const { register, watch, formState: { errors } } = useWizardContext();
  
  const name = watch("name") || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!name || name.trim().length < 2}
    >
      <Input
        {...register("name", {
          required: true,
          minLength: {
            value: 2,
            message: t('error')
          }
        })}
        placeholder={t('placeholder')}
        maxLength={50}
      />
      {errors.name && (
        <div className="input-error-text">
          {errors.name.message}
        </div>
      )}
    </StepContainer>
  );
}
```

