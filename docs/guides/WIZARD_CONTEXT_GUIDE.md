# Wizard Context/Store Guide

## Overview

The wizard now uses a React Context to store wizard data, allowing steps to access shared data without prop drilling. The context wraps a react-hook-form instance, so any step can read what earlier steps wrote (for example the `country`/`region` pair that `StepLocation` sets) and `Wizard.tsx` can autosave the whole form after each step.

## Architecture

### WizardContext
- **Location**: `app/profile/ui/WizardContext.tsx`
- **Purpose**: Provides centralized state management for wizard data
- **Features**:
  - Holds all wizard data in `useForm<Partial<Profile>>` (`mode: "onChange"`)
  - Exposes the full `UseFormReturn` (`register`, `watch`, `setValue`, `getValues`, `formState`, ...)
  - Tracks current step index
  - Provides navigation functions (`goToNextStep`, `goToPreviousStep`)

### WizardProvider
- Wraps the `FlexibleWizard` component
- Automatically provided by `FlexibleWizard` - no manual setup needed
- Props: `initialData` (form defaults; the form is `reset()` whenever this object changes by reference), `initialStepIndex`, optional `onDataChange`

## Usage in Steps

### Basic Usage

```typescript
import { useWizardContext } from "../WizardContext";

export function MyStep({ onNext }: StepProps) {
  const { watch, setValue } = useWizardContext();

  // Read any field from the form (reactive)
  const country = watch("country");
  const name = watch("name");

  // Write any field
  setValue("name", "Аня", { shouldDirty: true });
}
```

### Example: StepLocation writing two fields at once

```typescript
export function StepLocation({ onNext }: StepProps) {
  const { watch, setValue } = useWizardContext();

  const country = watch("country") || "";
  const region = watch("region") || "";
  // LOCATIONS is LocationOption[] { country, region, label, flag, available }
  const selected = LOCATIONS.find(
    (l) => l.available && l.country === country && l.region === region
  );

  const pick = (location: LocationOption) => {
    setValue("country", location.country, { shouldDirty: true });
    setValue("region", location.region, { shouldDirty: true });
  };
  // Later steps and the autosave see both values immediately
}
```

## Benefits

1. **No Prop Drilling**: Steps can access any wizard data without passing it through props
2. **Reactive Updates**: When one step updates data, other steps automatically have access to the new value
3. **Dependency Management**: Steps can depend on data from any previous step, not just the immediate parent
4. **One source of truth**: The same form feeds autosave (`getValues()` in `FlexibleWizard`) and the final `onComplete`

## Context API

### `useWizardContext()` Hook

Returns:
```typescript
{
  ...UseFormReturn<Partial<Profile>>; // register, watch, setValue, getValues, formState, reset, ...
  currentStepIndex: number;         // Current step index
  setCurrentStepIndex: (index: number) => void;  // Set step index
  goToNextStep: () => void;         // Navigate to next step
  goToPreviousStep: () => void;     // Navigate to previous step
}
```

### Example: Accessing data from any step

```typescript
// In StepReview (optional interstitial)
const name = watch("name");                   // From StepName

// In StepTheme
const profile = watch();                      // Whole form, rendered as a card preview
const interests = watch("interests");         // From StepInterests
const photo = watch("photo");                 // From StepPhoto
```

## Implementation Details

### How it works

1. `FlexibleWizard` wraps its content in `WizardProvider`
2. `WizardProvider` creates the form with `useForm` and shares it (plus the step index) through React Context
3. Steps use `useWizardContext()` hook to access the context
4. When a step calls `setValue()` or an input registered with `register()` changes, components that `watch()` the field re-render

### Data Flow

```
StepLocation → setValue("country"), setValue("region")
             → form state updates
             → onNext → FlexibleWizard calls onStepComplete(stepId, getValues())
             → Wizard.tsx autosaves via POST /api/profile
```

## Migration Notes

- Steps take only `{ onNext }` (`StepProps`); the old `data`/`onUpdate` props and `updateData()` no longer exist
- Extra per-step props can be passed through `props` in `wizardConfig.ts`
- See `REACT_HOOK_FORM_GUIDE.md` for `register`/`watch`/`setValue` patterns

## Best Practices

1. **Read with `watch()`**, default arrays/strings (`watch("values") || []`)
2. **Write with `setValue(field, value, { shouldDirty: true })`** or `register()` for inputs
3. **Use `useLimitedSelection(field, max)`** for capped multi-selects instead of hand-rolled toggles
4. **Keep local UI state local**: `useState` for things that are not saved (e.g. the carousel index in `StepTheme`)

