# Architecture Review and Refactoring

## 1. Executive Summary

The codebase has a solid foundation with Next.js 14 and a clean component structure. However, there are significant architectural discrepancies between the documentation (`ARCHITECTURE.md`) and the actual implementation, particularly regarding the database strategy and the onboarding flow.

**Key Issues Identified:**
1.  **Hybrid Database Architecture**: The application uses a mix of MongoDB and Google Sheets. `app/api/profile/[userId]` was fetching from Google Sheets while other parts (matching service) used MongoDB. This creates data inconsistency and scalability issues.
2.  **Broken Onboarding Flow**: The "Wizard" (`app/profile/ui/Wizard.tsx`) was a client-side only form with no persistence logic. Users could complete the steps, but the data was never saved to the backend.
3.  **API Gaps**: There was no endpoint to receive the profile data from the Wizard.
4.  **Schema Fragmentation**: Multiple user/profile schemas existed (`MatchingUser` in `lib/matchingService.ts`, `Profile` in `models/Profile.ts`, and frontend types in `models/types.ts`).

## 2. Changes Implemented

I have performed a targeted refactoring to align the implementation with the intended MongoDB-centric architecture and fix the onboarding flow.

### A. Data Modeling (`models/MatchingUser.ts`)
- **Extracted & Unified Schema**: Created a robust `MatchingUser` Mongoose model that consolidates fields from the matching service and the onboarding wizard.
- **Added Missing Fields**: Added `instagram`, `photo`, `announcement`, and `dateOfBirth` to the schema to support the wizard data.
- **Refactored Service**: Updated `lib/matchingService.ts` to use this shared model instead of an internal definition.

### B. API Development
- **Created `POST /api/profile`**: A new endpoint that accepts the wizard data and upserts it into the `MatchingUser` collection in MongoDB.
- **Updated `GET /api/profile/[userId]`**: Rewrote this endpoint to fetch data from MongoDB (`MatchingUser`) instead of Google Sheets, removing the dependency on the legacy `lib/googleSheets.ts` for this critical path.

### C. Frontend Integration
- **Connected Wizard**: Updated `Step13Review.tsx` in the onboarding wizard to submit data to `POST /api/profile`.
- **User Identification**: Added logic to `Wizard.tsx` to attempt to retrieve the Telegram User ID from the WebApp context, ensuring the profile is linked to the correct user.
- **Environment Handling**: Fixed build issues related to `window.Telegram` typing and missing `MONGODB_URI` during build time.

## 3. Recommendations for Next Steps

1.  **Complete Migration**: Audit the codebase for any remaining usages of `lib/googleSheets.ts` and migrate them to MongoDB.
2.  **Authentication**: Ensure `Wizard.tsx` reliably gets the `telegramId`. currently it falls back to a mock or empty string if not in the Telegram environment.
3.  **Validation**: Add Zod or a similar library for robust request validation in the API routes.
4.  **Refactor "Questions"**: Rename `app/questions` to `app/game` or `app/icebreakers` to avoid confusion with the onboarding flow.

## 4. Verification

The build passes successfully. The API routes now correctly interface with MongoDB, and the Frontend Wizard has the logic to persist data.
