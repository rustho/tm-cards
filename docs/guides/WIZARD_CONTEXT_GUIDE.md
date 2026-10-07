# Wizard Context/Store Guide

## Overview

The wizard now uses a React Context to store wizard data, allowing steps to access shared data without prop drilling. This is especially useful for steps that depend on data from previous steps (like `StepCity` depending on `StepCountry`).

## Architecture

### WizardContext
- **Location**: `app/profile/ui/WizardContext.tsx`
- **Purpose**: Provides centralized state management for wizard data
- **Features**:
  - Stores all wizard data (`Partial<Profile>`)
  - Provides `updateData` function to update wizard state
  - Tracks current step index
  - Provides navigation functions (`goToNextStep`, `goToPreviousStep`)

### WizardProvider
- Wraps the `FlexibleWizard` component
- Automatically provided by `FlexibleWizard` - no manual setup needed
- Manages wizard state lifecycle

## Usage in Steps

### Basic Usage

```typescript
import { useWizardContext } from "../WizardContext";

export function MyStep({ data: propData, onUpdate: propOnUpdate, onNext }: StepProps) {
  const wizardContext = useWizardContext();
  
  // Access data from context
  const data = wizardContext.data || propData || {};
  const onUpdate = wizardContext.updateData || propOnUpdate || (() => {});
  
  // Access any field from the wizard store
  const country = wizardContext.data?.country;
  const name = wizardContext.data?.name;
  // ... etc
}
```

### Example: StepCity accessing StepCountry data

```typescript
export function StepCity({ data: propData, onUpdate: propOnUpdate, onNext }: StepCityProps) {
  const wizardContext = useWizardContext();
  
  // Get country directly from wizard context/store
  // No need to pass it through props!
  const country = wizardContext.data?.country;
  
  // Use country to filter regions
  const regions = LOCATIONS.find(
    (location) => location.country === country
  )?.regions || [];
  
  // When StepCountry updates the country, StepCity automatically
  // has access to the new value through the context
}
```

## Benefits

1. **No Prop Drilling**: Steps can access any wizard data without passing it through props
2. **Reactive Updates**: When one step updates data, other steps automatically have access to the new value
3. **Dependency Management**: Steps can depend on data from any previous step, not just the immediate parent
4. **Backward Compatible**: Steps still accept props for backward compatibility

## Context API

### `useWizardContext()` Hook

Returns:
```typescript
{
  data: Partial<Profile>;           // Current wizard data
  updateData: (updates: Partial<Profile>) => void;  // Update wizard data
  currentStepIndex: number;         // Current step index
  setCurrentStepIndex: (index: number) => void;  // Set step index
  goToNextStep: () => void;         // Navigate to next step
  goToPreviousStep: () => void;     // Navigate to previous step
}
```

### Example: Accessing data from any step

```typescript
// In StepCity
const country = wizardContext.data?.country;  // From StepCountry

// In Step13Review
const name = wizardContext.data?.name;        // From StepName
const interests = wizardContext.data?.interests;  // From StepInterests
const photo = wizardContext.data?.photo;      // From StepPhoto
// ... access any field
```

## Implementation Details

### How it works

1. `FlexibleWizard` wraps its content in `WizardProvider`
2. `WizardProvider` manages wizard state using React Context
3. Steps use `useWizardContext()` hook to access the context
4. When a step calls `updateData()`, the context updates and all steps re-render with new data

### Data Flow

```
StepCountry → updateData({ country: "USA" }) 
           → WizardContext updates
           → StepCity automatically has access to country
           → StepCity re-renders with new country value
```

## Migration Notes

- Steps are **backward compatible** - they still accept `data` and `onUpdate` props
- Steps can use context OR props (context takes precedence)
- No breaking changes to existing step implementations
- New steps should use context for better data access

## Best Practices

1. **Use context for cross-step dependencies**: If your step depends on data from another step, use context
2. **Use props for step-specific data**: If data is only used within the step, props are fine
3. **Always provide fallback**: Use `wizardContext.data || propData || {}` pattern for backward compatibility
4. **Update through context**: Use `wizardContext.updateData()` to ensure all steps see the update

