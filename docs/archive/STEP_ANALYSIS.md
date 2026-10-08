# Step Components Analysis

## Overview
This document analyzes all step components in `/app/profile/ui/steps/` to identify similarities and differences.

## Step Categories

### 1. **Text Input Steps** (Single text field)
These steps use a simple text input field:
- **Step1Name.tsx** / **StepName.tsx** - Name input
- **Step3Occupation.tsx** - Occupation input
- **Step7Travel.tsx** - Places to visit input
- **Step9Instagram.tsx** / **StepSocials.tsx** - Instagram handle input

**Common Pattern:**
- Uses `Input` component
- Validates minimum length (usually 2+ characters)
- Calls `onUpdate` on every change
- Calls `onNext` only when Next button is clicked

**Differences:**
- Step9Instagram/StepSocials: Removes `@` symbol automatically
- Step1Name: Has validation error message display
- Step3Occupation: Has validation error message display

---

### 2. **Date Input Steps** (Date picker)
- **Step2DateOfBirth.tsx** / **StepDateOfBirth.tsx** - Date of birth

**Pattern:**
- Uses `Input` with `type="date"`
- Has date validation (18-100 years old)
- Shows age display when valid
- Has min/max date constraints

**Differences:**
- Step2DateOfBirth: More comprehensive validation with error messages
- StepDateOfBirth: Simpler validation

---

### 3. **Multi-Selection Steps** (Select multiple items, max 4)
These steps allow selecting multiple items from a grid:
- **Step4Personality.tsx** / **StepPersonality.tsx** - Personality traits
- **Step5Interests.tsx** / **StepInterests.tsx** - Interests
- **Step6Hobbies.tsx** / **StepHobbies.tsx** - Hobbies

**Common Pattern:**
- Uses `SelectionGrid` with `maxSelections={4}`
- Uses `SelectedButton` components
- Toggle selection on click
- Disables buttons when max selections reached
- Validates that at least 1 item is selected
- Calls `onUpdate` on every selection change
- Calls `onNext` only when Next button is clicked

**Differences:**
- Step4Personality/StepPersonality: Shows error message if no selection
- Step5Interests/StepInterests: Uses translations
- Step6Hobbies/StepHobbies: No error message display

---

### 4. **Single Selection Steps** (Select one item)
- **StepGoal.tsx** - Goal selection

**Pattern:**
- Uses `SelectionGrid` with `maxSelections={1}`
- Uses `SelectedButton` components
- Only one selection allowed
- Calls `onUpdate` on selection
- Calls `onNext` only when Next button is clicked

---

### 5. **Textarea Steps** (Multi-line text)
- **Step8About.tsx** / **StepAbout.tsx** - About/Bio text
- **Step11Request.tsx** - Announcement/Request text

**Common Pattern:**
- Uses `Input` (Step8About) or `Textarea` (Step11Request)
- Has character limit (Step8About: 284 chars)
- Shows character count (Step8About)
- Calls `onUpdate` on every change
- Calls `onNext` only when Next button is clicked

**Differences:**
- Step8About: Uses `Input` with character count display
- Step11Request: Uses `Textarea` component
- StepAbout: Uses `profile` field instead of `about` field

---

### 6. **Location Steps** (Country/Region selection)
- **Step10Location.tsx** - Combined country + region
- **StepCountry.tsx** - Country only
- **StepCity.tsx** - Region/City only

**Common Pattern:**
- Uses `Select` component from Telegram UI
- Uses `LOCATIONS` data structure
- Calls `onUpdate` and `onNext` together in a handler

**Differences:**
- Step10Location: Combines country and region in one step
- StepCountry: Only country selection
- StepCity: Only region selection (depends on country)
- StepCountry/StepCity: Call `onNext()` inside `handleNext` function
- Step10Location: Calls `onNext()` inside `handleUpdate` function

---

### 7. **File Upload Steps** (Photo upload)
- **Step12Photo.tsx** / **StepPhoto.tsx** - Photo upload

**Common Pattern:**
- Uses file input with image preview
- Converts file to base64 string
- Shows preview when image is selected
- Calls `onUpdate` when file is selected
- Calls `onNext` only when Next button is clicked

**Differences:**
- StepPhoto: Uses `useEffect` to sync with data.photo
- Step12Photo: Simpler implementation

---

### 8. **Review/Submit Steps** (Final step)
- **Step13Review.tsx** - Review and submit

**Pattern:**
- Displays all collected data
- Has submit functionality
- Shows loading state during submission
- Shows error messages
- Calls `onNext` after successful submission

---

## Duplicate Steps

### Old Numbered Steps (Step1-Step13)
These appear to be older versions:
- Step1Name.tsx
- Step2DateOfBirth.tsx
- Step3Occupation.tsx
- Step4Personality.tsx
- Step5Interests.tsx
- Step6Hobbies.tsx
- Step7Travel.tsx
- Step8About.tsx
- Step9Instagram.tsx
- Step10Location.tsx
- Step11Request.tsx
- Step12Photo.tsx
- Step13Review.tsx

### New Named Steps (Currently Used)
These are used in `wizardConfig.ts`:
- StepName.tsx
- StepDateOfBirth.tsx
- StepPersonality.tsx
- StepInterests.tsx
- StepHobbies.tsx
- StepGoal.tsx
- StepPhoto.tsx
- StepSocials.tsx
- StepAbout.tsx
- StepCountry.tsx
- StepCity.tsx

**Key Differences:**
- Old steps use specific data types (e.g., `Profile["name"]`)
- New steps use `Partial<Profile>` for more flexibility
- Old steps have more detailed validation
- New steps are more modular and reusable

---

## Data Flow Patterns

### Pattern 1: Update on Change, Next on Button Click
**Most common pattern:**
```typescript
onChange={(e) => onUpdate({ field: e.target.value })}
onNext={onNext} // Called by StepContainer button
```

Used by:
- Text inputs (Name, Occupation, Travel, Instagram)
- Multi-selection (Personality, Interests, Hobbies)
- Single selection (Goal)
- Textarea (About, Request)
- File upload (Photo)

### Pattern 2: Update and Next Together
**Less common:**
```typescript
const handleNext = () => {
  onUpdate({ field: value });
  onNext();
};
```

Used by:
- StepCountry
- StepCity
- Step10Location

---

## Validation Patterns

1. **Required Field Validation:**
   - Most steps: `nextDisabled={!data.trim()}` or `nextDisabled={data.length === 0}`

2. **Minimum Length Validation:**
   - Name, Occupation: `data.trim().length >= 2`

3. **Date Validation:**
   - DateOfBirth: Age 18-100 years

4. **Selection Validation:**
   - Multi-select: `data.length > 0`
   - Single select: `!currentGoal`

5. **File Validation:**
   - Photo: `!data` or `!preview`

---

## Recommendations

1. ✅ **Consolidate duplicate steps** - Removed old numbered steps that have non-numbered equivalents
   - Removed: Step1Name, Step2DateOfBirth, Step4Personality, Step5Interests, Step6Hobbies, Step8About, Step9Instagram, Step10Location, Step12Photo
   - Kept: Step13Review (no non-numbered version), Step3Occupation, Step7Travel, Step11Request (not in wizard config but may be used elsewhere)

2. ✅ **Standardize validation** - All steps now use consistent validation patterns:
   - Text inputs: Minimum length validation (2+ characters for name)
   - Date inputs: Age validation (18-100 years) with error messages
   - Multi-select: At least 1 selection required
   - Single-select: Selection required
   - All use `nextDisabled` prop consistently

3. ✅ **Standardize error messages** - All steps now use translations:
   - All titles use `t('title')` from translations
   - All error messages use `t('error')` or specific error keys
   - Added missing translations for dateOfBirth errors, goal, location

4. ✅ **Fix auto-advance bug** - Fixed in FlexibleWizard.tsx: `onUpdate` now only updates data, doesn't advance steps

