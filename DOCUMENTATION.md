# TravelMate - Telegram Mini App Documentation

## Overview

TravelMate is a Telegram Mini App built with Next.js that connects travelers and helps them find compatible travel companions. The app features profile creation, matching functionality, and interactive question games to help users get to know each other.

## Tech Stack

- **Frontend**: Next.js 14.2.4 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Telegram UI (@telegram-apps/telegram-ui)
- **Telegram Integration**: @telegram-apps/sdk-react
- **Database**: MongoDB with Mongoose ODM
- **External Data**: Google Sheets API integration
- **Development**: Hot reload with HTTPS support

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── matches/       # Matching system endpoints
│   │   ├── profile/       # Profile management
│   │   └── users/         # User management
│   ├── home/              # Main dashboard
│   ├── profile/           # Profile creation/editing
│   ├── questions/         # Interactive question game
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── Root/              # App root wrapper
│   ├── SelectionGrid/     # Multi-select UI
│   ├── StepContainer/     # Form step wrapper
│   ├── Input/             # Form inputs
│   ├── DisplayData/       # Data display components
│   └── ...
├── lib/                   # Utility libraries
│   ├── googleSheets.ts    # Google Sheets integration
│   ├── mongodb.ts         # Database connection
│   └── profile.ts         # Profile utilities
├── models/                # Data models and types
│   ├── types.ts           # TypeScript interfaces
│   ├── Match.ts           # Match model
│   └── Profile.ts         # Profile model
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication logic
│   ├── useTelegramMock.ts # Development mocking
│   └── ...
├── config/                # Configuration files
│   └── constants.ts       # App constants
└── public/                # Static assets
```

## Core Features

### 1. User Authentication & Authorization
- **Telegram Integration**: Seamless authentication via Telegram
- **Admin System**: Special permissions for admin users (IDs: 135052006, 648216801)
- **Role-based Access**: Different interfaces for admins and regular users

### 2. Profile Management
- **Multi-step Profile Creation**: Wizard-based profile setup
- **Rich Profile Data**: 
  - Personal information (name, age, occupation)
  - Interests and hobbies selection
  - Personality traits
  - Travel preferences and destinations
  - Instagram integration
  - Personal announcements
- **Photo Upload**: Profile picture support
- **Location-based Profiles**: Country and region selection

### 3. Matching System
- **Compatibility Matching**: Algorithm-based user matching
- **Travel Destination Matching**: Connect users with similar travel plans
- **Interest-based Connections**: Match users with similar interests
- **Match History**: Track previous matches and connections

### 4. Interactive Question Game
- **Ice Breaker Questions**: Help users get to know each other
- **Game Flow**: Start → Game → End game progression
- **Custom Styling**: Tailored UI for gaming experience

### 5. Data Management
- **Google Sheets Integration**: External data storage and management
- **MongoDB Database**: Primary data persistence
- **Caching System**: Optimized data retrieval with TTL caching
- **Data Synchronization**: Real-time updates between systems

## Technical Architecture

### Frontend Architecture
- **Next.js App Router**: Modern routing with nested layouts
- **Component-based**: Modular, reusable components
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Telegram UI**: Native Telegram styling and components

### Backend Architecture
- **API Routes**: RESTful endpoints using Next.js API routes
- **Database Layer**: MongoDB with Mongoose for data modeling
- **External APIs**: Google Sheets API for data management
- **Authentication**: Telegram-based authentication system

### Data Models

#### User Profile
```typescript
interface ProfileData {
  id: string;
  username: string;
  name: string;
  age: string;
  about: string;
  occupation: string;
  interests: string[];
  hobbies: string[];
  personalityTraits: string[];
  country: string;
  region: string;
  placesToVisit: string;
  instagram: string;
  announcement: string;
  photo: string;
}
```

#### Match System
```typescript
interface User {
  id: string;
  username: string;
  name: string;
  goal: string;
  gender: string;
  country: string;
  region: string;
  interests: string[];
  previousMatch: any[];
  nextMatch: string;
  skip: number;
}
```

### Available Locations
- **Vietnam**: Da Nang, Nha Trang
- **Bali**: Canggu, Ubud, Bukit
- **Thailand**: Bangkok, Phuket, Pattaya, Chiang Mai
- **Sri Lanka**: Colombo, Kandy

### Predefined Options
- **20 Personality Traits**: Creative, Ambitious, Kind, Open, etc.
- **20 Interests**: Travel, Art, Music, Sports, Cooking, etc.
- **20 Hobbies**: Swimming, Running, Yoga, Cycling, etc.

## API Endpoints

### Matches API
- `GET /api/matches/[userId]` - Retrieve user matches
- Returns array of matched user profiles

### Profile API
- Profile management endpoints (implementation in progress)

### Users API
- User data management endpoints (implementation in progress)

## Development Features

### Telegram Development Tools
- **Mock Environment**: `useTelegramMock.ts` simulates Telegram environment for local development
- **HTTPS Development**: Support for HTTPS in development mode
- **Hot Reload**: Fast development iteration

### Environment Configuration
- **Google Sheets**: Requires Google Service Account credentials
- **MongoDB**: Database connection configuration
- **Telegram Bot**: Bot token and Mini App setup

## Security Features
- **Admin Role Verification**: Hardcoded admin Telegram IDs
- **API Route Protection**: Server-side validation
- **Data Sanitization**: Input validation and sanitization
- **Secure External API**: Authenticated Google Sheets access

## Performance Optimizations
- **Data Caching**: 5-minute TTL cache for Google Sheets data
- **Component Optimization**: Efficient re-rendering with React hooks
- **API Response Optimization**: Structured error handling
- **Asset Optimization**: Next.js built-in optimizations

## UI/UX Features
- **Native Telegram Look**: Consistent with Telegram design system
- **Responsive Design**: Works across different screen sizes
- **Loading States**: User feedback during data operations
- **Error Handling**: Graceful error displays
- **Navigation**: Footer menu navigation system

## Setup and Installation

1. **Dependencies**: Install with `pnpm install`
2. **Environment Variables**: Configure Google Sheets and MongoDB credentials
3. **Development**: Run with `pnpm run dev` or `pnpm run dev:https`
4. **Production**: Build with `pnpm run build` and start with `pnpm run start`

## Menu Structure
- **Question Cards**: Interactive question game
- **Profile Creation**: Multi-step profile setup
- **Home**: Main dashboard with matches
- **Settings**: User preferences (planned)

## Future Enhancements
- Complete profile API implementation
- Enhanced matching algorithms
- Real-time chat functionality
- Advanced filtering options
- Push notifications
- Multi-language support (i18n structure present)

## Development Notes
- Built as a Telegram Mini App template
- Designed for travel companion matching
- Integrates with Google Sheets for data management
- Uses MongoDB for primary data storage
- Includes comprehensive TypeScript typing
- Mobile-first responsive design 