# Flexible Wizard Implementation Guide

## Overview

This guide explains how to implement a flexible profile wizard that supports both full profile creation flows and individual step editing. The implementation allows for maximum flexibility in user experience design.

## Current State Analysis

### Existing Implementation (`app/profile/ui/Wizard.tsx`)

**Strengths:**
- Clean, consistent step interface
- Progress tracking
- Validation per step
- Reusable components

**Limitations:**
- Linear flow only
- No step jumping
- No persistence
- Single mode operation

## New Flexible Implementation

### Core Components

#### 1. FlexibleWizard (`app/profile/ui/FlexibleWizard.tsx`)

The main wizard component that supports multiple modes:

```typescript
interface FlexibleWizardProps {
  mode?: 'full' | 'edit';           // Wizard mode
  initialStep?: number;             // Starting step
  initialData?: Partial<Profile>;   // Pre-populated data
  onComplete?: (data: Profile) => void;           // Full completion callback
  onStepComplete?: (step: number, data: Partial<Profile>) => void;  // Single step callback
  onCancel?: () => void;            // Cancel callback
}
```

**Key Features:**
- **Dual Mode Operation**: Full wizard flow or single step editing
- **Step Navigation**: Visual step indicators with completion status
- **Smart Validation**: Real-time step completion tracking
- **Flexible Callbacks**: Different handlers for different scenarios

#### 2. Enhanced Step Management

```typescript
interface WizardStep {
  id: number;
  name: string;
  completed: boolean;
  required: boolean;
}
```

**Benefits:**
- Track completion status
- Distinguish required vs optional steps
- Enable conditional navigation
- Support progress visualization

## Usage Patterns

### 1. Full Profile Creation Flow

```typescript
<FlexibleWizard 
  mode="full"
  onComplete={(data) => {
    // Save complete profile
    saveProfile(data);
  }}
/>
```

**Features:**
- Sequential step progression
- Progress indicator
- Step navigation grid
- Complete profile submission

### 2. Single Step Editing

```typescript
<FlexibleWizard
  mode="edit"
  initialStep={5}
  initialData={existingProfile}
  onStepComplete={(step, data) => {
    // Update specific field
    updateProfileField(step, data);
  }}
  onCancel={() => {
    // Close editor
    closeEditor();
  }}
/>
```

**Features:**
- Edit mode UI
- Single step focus
- Save or cancel options
- Immediate updates

### 3. Profile Review with Inline Editing

```typescript
// Main review component
<ProfileReviewWithEditing />

// Opens modal for specific field editing
<FlexibleWizard
  mode="edit"
  initialStep={editingField.step}
  initialData={currentProfile}
  onStepComplete={(step, data) => {
    setProfile(prev => ({ ...prev, ...data }));
    closeModal();
  }}
/>
```

**Features:**
- Modal-based editing
- Context preservation
- Non-disruptive flow
- Field-specific editing

### 4. Progressive Profile Completion

```typescript
<FlexibleWizard
  mode="edit"
  initialStep={nextIncompleteStep}
  initialData={partialProfile}
  onStepComplete={(step, data) => {
    updateProfile(data);
    markStepComplete(step);
  }}
/>
```

**Features:**
- Completion tracking
- Required vs optional steps
- Progress visualization
- Flexible completion order

## Implementation Benefits

### User Experience

1. **Flexibility**: Users can complete profiles at their own pace
2. **Non-linear**: Jump to specific sections when needed
3. **Progressive**: Build profiles incrementally
4. **Contextual**: Edit specific fields without losing context

### Developer Experience

1. **Reusable**: Same component for different use cases
2. **Configurable**: Props-driven behavior
3. **Maintainable**: Single source of truth for wizard logic
4. **Extensible**: Easy to add new modes or features

### Business Benefits

1. **Higher Completion Rates**: Users can save progress and return
2. **Better Data Quality**: Easy editing encourages profile updates
3. **Reduced Friction**: Edit individual fields without full flow
4. **User Retention**: Progressive completion reduces abandonment

## Advanced Features

### Step Validation & Dependencies

```typescript
const isStepCompleted = (stepId: number): boolean => {
  switch (stepId) {
    case 1: return profileData.name.trim().length >= 2;
    case 5: return profileData.interests.length > 0;
    case 7: return profileData.placesToVisit.trim().length > 0;
    // ... more validation logic
  }
};
```

### Dynamic Step Navigation

```typescript
const handleStepJump = (stepId: number) => {
  if (mode === 'full') {
    // Allow jumping to completed steps or next incomplete step
    setCurrentStep(stepId);
  }
};
```

### Progress Tracking

```typescript
const completionPercentage = Math.round((completedSteps.length / TOTAL_STEPS) * 100);
const requiredCompletion = requiredSteps.every(step => completedSteps.includes(step));
```

## Integration Examples

### 1. Settings Page Integration

```typescript
// User clicks "Edit Profile" → Single field editing
<button onClick={() => editField('interests', 5)}>
  Edit Interests
</button>
```

### 2. Onboarding Flow

```typescript
// New user registration → Full wizard
<FlexibleWizard 
  mode="full"
  onComplete={completeOnboarding}
/>
```

### 3. Profile Completeness Widget

```typescript
// Dashboard widget → Progressive completion
<ProfileCompletionWidget 
  onContinue={() => startWizard('edit', nextStep)}
/>
```

## Styling & Theming

The implementation includes comprehensive CSS for:

- **Full Mode**: Progress bars, step navigation, completion indicators
- **Edit Mode**: Modal styling, focused editing interface
- **Responsive Design**: Mobile-optimized layouts
- **Accessibility**: Keyboard navigation, screen reader support

## Best Practices

### 1. Data Persistence

```typescript
// Auto-save draft data
useEffect(() => {
  if (mode === 'full') {
    saveDraft(profileData);
  }
}, [profileData]);
```

### 2. Validation Strategy

- Validate on blur for immediate feedback
- Block progression for required fields
- Show completion status for optional fields

### 3. Error Handling

```typescript
const handleStepComplete = async (step: number, data: Partial<Profile>) => {
  try {
    await updateProfile(data);
    setCompletedSteps(prev => [...prev, step]);
  } catch (error) {
    showError('Failed to save changes');
  }
};
```

### 4. Performance Optimization

- Lazy load step components
- Debounce auto-save operations
- Memoize validation functions

## Migration Strategy

### Phase 1: Parallel Implementation
- Keep existing wizard for current users
- Deploy new wizard for new features

### Phase 2: Feature Parity
- Ensure all existing functionality works
- Add enhanced features gradually

### Phase 3: Full Migration
- Replace old wizard with new implementation
- Remove deprecated code

## Conclusion

The flexible wizard implementation provides a robust foundation for profile management that can adapt to various user journeys and business requirements. It maintains the simplicity of the original design while adding powerful new capabilities for modern user experiences.

The key to success is choosing the right mode and configuration for each use case, ensuring that users always have the most appropriate interface for their current needs. 