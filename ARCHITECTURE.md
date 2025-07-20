# 🗺️ TravelMate App Architecture Documentation

## 📋 Project Overview

**TravelMate** is a Telegram Mini App that connects travelers based on shared interests, destinations, and personality traits. The app features automated matching, travel recommendations, and Telegram bot integration with comprehensive MongoDB data persistence.

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 14.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Telegram UI Components
- **State Management**: React Hooks
- **Forms**: React Hook Form
- **Internationalization**: next-intl
- **Mobile Gestures**: react-swipeable

### **Backend**
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Bot Framework**: Telegraf (Telegram Bot API)
- **Scheduling**: node-cron
- **Development Tools**: MongoDB Memory Server
- **Data Modeling**: Mongoose schemas with validation
- **Database Features**: Indexing, aggregation pipelines, transactions

### **Telegram Integration**
- **SDK**: @telegram-apps/sdk-react
- **UI Components**: @telegram-apps/telegram-ui
- **Environment**: Telegram Mini Apps Platform

## 🏗️ Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM MINI APP                        │
├─────────────────────────────────────────────────────────────┤
│                    FRONTEND (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Profile   │  │   Matching  │  │   Settings  │        │
│  │    Pages    │  │    System   │  │   Manager   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                     API LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │     Bot     │  │   Matching  │  │    Health   │        │
│  │     API     │  │     API     │  │    Check    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    SERVICES LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Telegram   │  │   Matching  │  │ Notification│        │
│  │   Bot       │  │   Service   │  │   Service   │        │
│  │  Service    │  └─────────────┘  └─────────────┘        │
│  └─────────────┘  ┌─────────────┐  ┌─────────────┐        │
│                   │   Scheduler │  │   Logger    │        │
│                   │   Service   │  │   Service   │        │
│                   └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                   MONGODB DATA LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Users    │  │   Matches   │  │   Bot Logs  │        │
│  │ Collection  │  │ Collection  │  │ Collection  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Profiles  │  │   Settings  │  │ Notifications│        │
│  │ Collection  │  │ Collection  │  │ Collection  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Analytics  │  │   Sessions  │  │   Travel    │        │
│  │ Collection  │  │ Collection  │  │ Collection  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
tm-cards/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 bot/                  # Telegram Bot Endpoints
│   │   │   ├── 📁 logs/             # Bot logging endpoints
│   │   │   ├── 📁 start/            # Bot start/stop control
│   │   │   └── 📁 webhook/          # Webhook management
│   │   ├── 📁 matching/             # Matching System API
│   │   ├── 📁 health/               # Health Check
│   │   ├── 📁 profile/              # Profile Management
│   │   ├── 📁 settings/             # Settings API
│   │   ├── 📁 matches/              # Match Management
│   │   └── 📁 users/                # User Management
│   ├── 📁 home/                     # Home Page
│   ├── 📁 profile/                  # Profile Pages
│   ├── 📁 settings/                 # Settings Pages
│   ├── 📁 questions/                # Onboarding Flow
│   ├── 📁 mocks/                    # Mock Data Pages
│   ├── 📁 _assets/                  # Static Assets
│   ├── layout.tsx                   # Root Layout
│   ├── page.tsx                     # Home Page
│   ├── not-found.tsx                # 404 Page
│   └── error.tsx                    # Error Page
├── 📁 lib/                          # Core Services
│   ├── telegramBot.ts               # Bot Service (646 lines)
│   ├── matchingService.ts           # Matching Algorithm (487 lines)
│   ├── botNotificationService.ts    # Notifications (322 lines)
│   ├── matchingScheduler.ts         # Cron Jobs (326 lines)
│   ├── botLogger.ts                 # Logging System (365 lines)
│   ├── initializeServices.ts        # Service Orchestration (195 lines)
│   ├── settingsService.ts           # Settings Management (73 lines)
│   ├── profile.ts                   # Profile Utils (45 lines)
│   ├── googleSheets.ts              # Google Sheets Integration (74 lines)
│   └── mongodb.ts                   # Database Connection (49 lines)
├── 📁 components/                   # UI Components
│   ├── 📁 Root/                     # App Root Component
│   ├── 📁 SelectionGrid/            # Selection UI
│   ├── 📁 StepContainer/            # Wizard Steps
│   ├── 📁 SelectedButton/           # Button Components
│   ├── 📁 Input/                    # Input Components
│   ├── 📁 DisplayData/              # Data Display
│   ├── 📁 Link/                     # Link Components
│   ├── 📁 LocaleSwitcher/           # Language Switcher
│   ├── 📁 RGB/                      # Color Components
│   ├── ErrorBoundary.tsx            # Error Handling
│   ├── ErrorPage.tsx                # Error Page Component
│   ├── AdminMenu.tsx                # Admin Interface
│   ├── FooterMenu.tsx               # Navigation Menu
│   ├── Page.tsx                     # Page Wrapper
│   └── index.ts                     # Component Exports
├── 📁 models/                       # Data Models
│   ├── types.ts                     # TypeScript Interfaces (167 lines)
│   ├── Profile.ts                   # Profile Schema (24 lines)
│   └── Match.ts                     # Match Schema (24 lines)
├── 📁 hooks/                        # React Hooks
│   ├── useAuth.ts                   # Authentication (14 lines)
│   ├── useTelegramMock.ts           # Development Mock (107 lines)
│   ├── useClientOnce.ts             # Client-side Hook (9 lines)
│   └── useDidMount.ts               # Mount Hook (14 lines)
├── 📁 config/                       # Configuration
│   └── constants.ts                 # App Constants (26 lines)
├── 📁 core/                         # Core Logic
│   ├── 📁 i18n/                     # Internationalization
│   └── init.ts                      # Core Initialization (45 lines)
├── 📁 scripts/                      # Utility Scripts
├── 📁 public/                       # Static Assets
├── 📁 assets/                       # App Assets
├── 📁 certificates/                 # SSL Certificates
├── 📁 __mocks__/                    # Test Mocks
└── Configuration Files
    ├── package.json                 # Dependencies & Scripts
    ├── tsconfig.json                # TypeScript Config
    ├── next.config.mjs              # Next.js Config
    ├── tailwind.config.ts           # Tailwind Config
    ├── postcss.config.js            # PostCSS Config
    └── .gitignore                   # Git Ignore Rules
```

## 🔄 Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Telegram  │───▶│  Mini App   │───▶│  Next.js    │
│     Bot     │    │  Frontend   │    │  API Routes │
└─────────────┘    └─────────────┘    └─────────────┘
        │                                      │
        │          ┌─────────────┐              │
        └─────────▶│   Service   │◀─────────────┘
                   │    Layer    │
                   └─────────────┘
                          │
                   ┌─────────────┐
                   │  MongoDB    │
                   │  Database   │
                   └─────────────┘
```

## 🎯 Key Services

### **1. TelegramBotService** (`lib/telegramBot.ts`)
- **Purpose**: Manages Telegram bot interactions
- **Features**: 
  - Webhook handling
  - Command processing
  - Message routing
  - Mini app integration
  - User authentication
  - Rich message formatting
- **Size**: 646 lines - Main orchestrator
- **Key Methods**:
  - `initialize()` - Setup bot and webhook
  - `handleUpdate()` - Process incoming messages
  - `sendMatchNotification()` - Send match alerts
  - `sendTravelTip()` - Send travel recommendations

### **2. MatchingService** (`lib/matchingService.ts`)
- **Purpose**: Core matching algorithm
- **Features**:
  - Compatibility scoring
  - Interest-based matching
  - Location filtering
  - Match history tracking
  - Age preference filtering
  - Personality trait matching
- **Size**: 487 lines - Core business logic
- **Key Methods**:
  - `findMatches()` - Find compatible users
  - `calculateCompatibility()` - Score compatibility
  - `createMatch()` - Create match records
  - `getMatchHistory()` - Track user matches

### **3. BotNotificationService** (`lib/botNotificationService.ts`)
- **Purpose**: Handles notifications to users
- **Features**:
  - Match notifications
  - Travel tips
  - Profile reminders
  - Bulk messaging
  - Scheduled notifications
  - Template system
- **Size**: 322 lines - Communication layer
- **Key Methods**:
  - `notifyNewMatch()` - Send match notifications
  - `sendProfileReminder()` - Profile completion alerts
  - `sendDailyTravelTip()` - Travel recommendations
  - `sendBulkNotification()` - Mass messaging

### **4. MatchingScheduler** (`lib/matchingScheduler.ts`)
- **Purpose**: Automated matching execution
- **Features**:
  - Cron-based scheduling
  - Match generation
  - Performance monitoring
  - Configurable timing
  - Manual triggering
- **Size**: 326 lines - Automation engine
- **Key Methods**:
  - `start()` - Start scheduled matching
  - `stop()` - Stop scheduler
  - `runMatching()` - Execute matching algorithm
  - `getStatus()` - Monitor scheduler health

### **5. BotLogger** (`lib/botLogger.ts`)
- **Purpose**: Comprehensive logging system
- **Features**:
  - User action tracking
  - Error logging
  - Analytics data
  - Performance metrics
  - Log cleanup
  - Export capabilities
- **Size**: 365 lines - Monitoring system
- **Key Methods**:
  - `logUserAction()` - Track user interactions
  - `logError()` - Record errors
  - `getAnalytics()` - Generate reports
  - `cleanupOldLogs()` - Manage log retention

## 🗄️ MongoDB Database Architecture

### **Database Design Principles**
- **Single Database**: All collections in one MongoDB database
- **Normalized Structure**: Proper relationships with ObjectId references
- **Indexing Strategy**: Optimized queries with compound indexes
- **Data Validation**: Mongoose schema validation
- **Transactions**: ACID compliance for critical operations
- **Aggregation**: Complex queries using MongoDB aggregation pipeline

### **Core Collections Overview**

```
TravelMate Database
├── 👤 users                    # Core user data
├── 👤 profiles                 # Extended profile information  
├── 🤝 matches                  # Match relationships
├── 💬 conversations            # Chat conversations
├── 📄 messages                 # Individual messages
├── ⚙️  settings                # User preferences
├── 🔔 notifications            # Notification queue
├── 📊 analytics               # User analytics
├── 📋 bot_logs                # Bot interaction logs
├── 🎯 interests               # Available interests/hobbies
├── 🌍 locations               # Location data
├── ✈️  travel_tips            # Travel recommendations
├── 👁️  profile_views          # Profile view tracking
├── 🔄 sessions                # User sessions
└── 📈 app_metrics             # Application metrics
```

### **Detailed Entity Definitions**

#### **1. Users Collection** 
*Primary user data and authentication*
```typescript
interface User {
  _id: ObjectId;
  telegramId: string;           // Telegram user ID (unique)
  chatId?: string;              // Telegram chat ID
  username?: string;            // Telegram username
  firstName: string;            // Telegram first name
  lastName?: string;            // Telegram last name
  languageCode?: string;        // Telegram language preference
  isPremium?: boolean;          // Telegram premium status
  status: 'active' | 'inactive' | 'banned' | 'pending';
  isOnline: boolean;
  lastSeen: Date;
  registrationDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

#### **2. Profiles Collection**
*Extended user profile information for matching*
```typescript
interface Profile {
  _id: ObjectId;
  userId: ObjectId;             // Reference to Users
  // Basic Info
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_say';
  location: {
    country: string;
    city: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  bio: string;
  occupation?: string;
  
  // Travel Preferences
  travelStyle: ('budget' | 'luxury' | 'backpacking' | 'business' | 'adventure')[];
  preferredDestinations: string[];
  travelFrequency: 'rarely' | 'few_times_year' | 'monthly' | 'weekly';
  
  // Interests & Personality
  interests: ObjectId[];        // Reference to Interests
  hobbies: string[];
  personalityTraits: string[];
  languages: string[];
  
  // Social Links
  instagram?: string;
  socialLinks?: {
    platform: string;
    username: string;
  }[];
  
  // Matching Preferences
  ageRange: {
    min: number;
    max: number;
  };
  genderPreference: ('male' | 'female' | 'other')[];
  maxDistance?: number;         // km
  
  // Profile Status
  isComplete: boolean;
  completionPercentage: number;
  isActive: boolean;
  photos: {
    url: string;
    isPrimary: boolean;
    uploadedAt: Date;
  }[];
  
  // Metadata
  profileViews: number;
  lastProfileUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **3. Matches Collection**
*Match relationships and compatibility data*
```typescript
interface Match {
  _id: ObjectId;
  user1Id: ObjectId;           // Reference to Users
  user2Id: ObjectId;           // Reference to Users
  
  // Match Quality
  compatibilityScore: number;   // 0-100
  matchingFactors: {
    factor: string;
    score: number;
    weight: number;
  }[];
  
  // Match Status
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'blocked';
  initiatedBy: ObjectId;       // Who initiated the match
  
  // Interaction History
  user1Status: 'pending' | 'liked' | 'passed';
  user2Status: 'pending' | 'liked' | 'passed';
  conversationId?: ObjectId;   // Reference to Conversations
  
  // Notifications
  notificationsSent: {
    userId: ObjectId;
    type: string;
    sentAt: Date;
  }[];
  
  // Timestamps
  matchedAt: Date;
  respondedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **4. Conversations Collection**
*Chat conversations between matched users*
```typescript
interface Conversation {
  _id: ObjectId;
  matchId: ObjectId;           // Reference to Matches
  participants: ObjectId[];     // Array of User IDs
  
  // Conversation Status
  status: 'active' | 'archived' | 'blocked';
  isRead: {
    [userId: string]: boolean;
  };
  
  // Message Statistics
  messageCount: number;
  lastMessageAt?: Date;
  lastMessageBy?: ObjectId;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

#### **5. Messages Collection**
*Individual messages within conversations*
```typescript
interface Message {
  _id: ObjectId;
  conversationId: ObjectId;    // Reference to Conversations
  senderId: ObjectId;          // Reference to Users
  
  // Message Content
  content: string;
  messageType: 'text' | 'image' | 'location' | 'system';
  attachments?: {
    type: string;
    url: string;
    filename?: string;
  }[];
  
  // Message Status
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  
  // Metadata
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **6. Settings Collection**
*User preferences and configuration*
```typescript
interface Settings {
  _id: ObjectId;
  userId: ObjectId;            // Reference to Users
  
  // Notification Preferences
  notifications: {
    newMatches: boolean;
    messages: boolean;
    profileViews: boolean;
    travelTips: boolean;
    weeklyDigest: boolean;
    push: boolean;
    email: boolean;
  };
  
  // Privacy Settings
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowProfileViews: boolean;
    showAge: boolean;
    showLocation: boolean;
  };
  
  // Matching Preferences
  matching: {
    isActive: boolean;
    pauseUntil?: Date;
    pauseReason?: string;
    maxMatchesPerDay: number;
    autoLike: boolean;
  };
  
  // App Preferences
  app: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    units: 'metric' | 'imperial';
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **7. Notifications Collection**
*Notification queue and history*
```typescript
interface Notification {
  _id: ObjectId;
  userId: ObjectId;            // Reference to Users
  
  // Notification Content
  type: 'match' | 'message' | 'profile_view' | 'travel_tip' | 'system';
  title: string;
  message: string;
  data?: any;                  // Additional data payload
  
  // Delivery Status
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  channel: 'telegram' | 'push' | 'email';
  
  // Timing
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  
  // Metadata
  priority: 'low' | 'medium' | 'high' | 'urgent';
  retryCount: number;
  errorMessage?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **8. Analytics Collection**
*User behavior and app analytics*
```typescript
interface Analytics {
  _id: ObjectId;
  userId?: ObjectId;           // Reference to Users (nullable for global analytics)
  
  // Event Data
  eventType: string;           // e.g., 'profile_view', 'match_created', 'message_sent'
  eventData: any;              // Event-specific data
  
  // Session Information
  sessionId?: string;
  source: 'telegram_bot' | 'mini_app' | 'web' | 'api';
  userAgent?: string;
  
  // Geographic Data
  location?: {
    country: string;
    city: string;
    ip?: string;
  };
  
  // Timing
  timestamp: Date;
  duration?: number;           // For session-based events
  
  createdAt: Date;
}
```

#### **9. Bot Logs Collection**
*Comprehensive bot interaction logging*
```typescript
interface BotLog {
  _id: ObjectId;
  userId?: ObjectId;           // Reference to Users
  chatId?: string;
  
  // Log Details
  type: 'command' | 'message' | 'callback' | 'error' | 'webhook' | 'notification';
  command?: string;
  message?: string;
  data?: any;
  
  // Response Information
  response?: string;
  success: boolean;
  errorMessage?: string;
  executionTime?: number;      // milliseconds
  
  // Metadata
  timestamp: Date;
  createdAt: Date;
}
```

#### **10. Interests Collection**
*Available interests and hobbies catalog*
```typescript
interface Interest {
  _id: ObjectId;
  name: string;
  category: string;            // e.g., 'sports', 'culture', 'food', 'adventure'
  subcategory?: string;
  description?: string;
  isActive: boolean;
  userCount: number;           // How many users have this interest
  
  // Localization
  translations: {
    [languageCode: string]: {
      name: string;
      description?: string;
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **11. Locations Collection**
*Geographic data for matching*
```typescript
interface Location {
  _id: ObjectId;
  name: string;
  type: 'country' | 'city' | 'region' | 'landmark';
  
  // Geographic Data
  coordinates: [number, number]; // [longitude, latitude]
  bounds?: {
    northeast: [number, number];
    southwest: [number, number];
  };
  
  // Hierarchy
  country: string;
  region?: string;
  city?: string;
  
  // Metadata
  userCount: number;           // Users in this location
  isPopular: boolean;
  timezone?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **12. Travel Tips Collection**
*Travel recommendations and tips*
```typescript
interface TravelTip {
  _id: ObjectId;
  title: string;
  content: string;
  category: 'safety' | 'culture' | 'food' | 'transport' | 'accommodation' | 'general';
  
  // Targeting
  destinations?: string[];      // Specific locations
  interests?: ObjectId[];      // Related interests
  travelStyle?: string[];      // Target travel styles
  
  // Content Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;   // minutes
  tags: string[];
  
  // Engagement
  views: number;
  likes: number;
  shares: number;
  
  // Publishing
  isActive: boolean;
  publishedAt?: Date;
  createdBy: ObjectId;         // Reference to admin user
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **13. Profile Views Collection**
*Track profile view history*
```typescript
interface ProfileView {
  _id: ObjectId;
  viewerId: ObjectId;          // Reference to Users (who viewed)
  viewedId: ObjectId;          // Reference to Users (who was viewed)
  
  // View Context
  source: 'matching' | 'search' | 'conversation' | 'direct';
  matchId?: ObjectId;          // If viewed through matching
  
  // View Data
  viewDuration?: number;       // seconds
  interactions: string[];      // e.g., ['photo_viewed', 'bio_read']
  
  // Metadata
  viewedAt: Date;
  createdAt: Date;
}
```

#### **14. Sessions Collection**
*User session tracking*
```typescript
interface Session {
  _id: ObjectId;
  userId: ObjectId;            // Reference to Users
  sessionId: string;           // Unique session identifier
  
  // Session Data
  platform: 'telegram_bot' | 'mini_app' | 'web';
  device: {
    type: 'mobile' | 'desktop' | 'tablet';
    os?: string;
    browser?: string;
  };
  
  // Activity
  startTime: Date;
  endTime?: Date;
  lastActivity: Date;
  activityCount: number;
  pagesVisited: string[];
  
  // Location
  ipAddress?: string;
  location?: {
    country: string;
    city: string;
  };
  
  // Status
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **15. App Metrics Collection**
*Application-wide metrics and KPIs*
```typescript
interface AppMetric {
  _id: ObjectId;
  
  // Metric Identity
  metricType: string;          // e.g., 'daily_active_users', 'matches_created'
  value: number;
  unit?: string;               // e.g., 'count', 'percentage', 'milliseconds'
  
  // Dimensions
  dimensions: {
    [key: string]: string;     // e.g., { platform: 'telegram', region: 'europe' }
  };
  
  // Time Series
  timestamp: Date;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  
  // Metadata
  calculatedAt: Date;
  source: string;              // What calculated this metric
  
  createdAt: Date;
}
```

### **Database Indexes Strategy**

```typescript
// Critical Indexes for Performance
const indexes = {
  users: [
    { telegramId: 1 },         // Unique
    { status: 1, isOnline: 1 },
    { lastSeen: -1 }
  ],
  
  profiles: [
    { userId: 1 },             // Unique
    { 'location.country': 1, 'location.city': 1 },
    { isActive: 1, isComplete: 1 },
    { age: 1, gender: 1 },
    { interests: 1 }
  ],
  
  matches: [
    { user1Id: 1, user2Id: 1 }, // Compound unique
    { status: 1, expiresAt: 1 },
    { compatibilityScore: -1 },
    { createdAt: -1 }
  ],
  
  conversations: [
    { matchId: 1 },            // Unique
    { participants: 1 },
    { status: 1, lastMessageAt: -1 }
  ],
  
  messages: [
    { conversationId: 1, sentAt: -1 },
    { senderId: 1, sentAt: -1 }
  ],
  
  notifications: [
    { userId: 1, status: 1 },
    { scheduledFor: 1, status: 1 },
    { type: 1, createdAt: -1 }
  ],
  
  analytics: [
    { userId: 1, timestamp: -1 },
    { eventType: 1, timestamp: -1 },
    { timestamp: -1 }           // Time-series queries
  ],
  
  bot_logs: [
    { userId: 1, timestamp: -1 },
    { type: 1, timestamp: -1 },
    { success: 1, timestamp: -1 }
  ]
};
```

### **Data Relationships**

```
Users (1) ←→ (1) Profiles
Users (1) ←→ (∞) Matches
Users (1) ←→ (∞) Conversations
Users (1) ←→ (∞) Messages
Users (1) ←→ (1) Settings
Users (1) ←→ (∞) Notifications
Users (1) ←→ (∞) Analytics
Users (1) ←→ (∞) BotLogs
Users (1) ←→ (∞) ProfileViews
Users (1) ←→ (∞) Sessions

Matches (1) ←→ (1) Conversations
Conversations (1) ←→ (∞) Messages
Interests (1) ←→ (∞) Profiles.interests
Interests (1) ←→ (∞) TravelTips.interests
```

## 🎨 Frontend Architecture

### **Page Structure**
```
app/
├── page.tsx                    # Home/Landing page
├── layout.tsx                  # Root layout with providers
├── error.tsx                   # Global error boundary
├── not-found.tsx              # 404 error page
├── profile/                   # Profile management pages
├── settings/                  # User settings pages
├── questions/                 # Onboarding wizard
├── home/                      # Home dashboard
└── mocks/                     # Mock data pages for development
```

### **Component Hierarchy**
```
Root Component
├── I18nProvider (Internationalization)
├── TelegramProvider (Telegram SDK)
├── ErrorBoundary (Error handling)
├── Page Components
│   ├── StepContainer (Multi-step wizard)
│   ├── SelectionGrid (Multi-select interface)
│   ├── DisplayData (Data visualization)
│   ├── Input (Form inputs)
│   └── SelectedButton (Interactive buttons)
├── Navigation
│   ├── FooterMenu (Bottom navigation)
│   └── AdminMenu (Admin controls)
└── Utilities
    ├── LocaleSwitcher (Language selection)
    └── Link (Navigation links)
```

### **State Management**
- **Global State**: React Context + Providers
- **Local State**: React Hooks (useState, useEffect)
- **Form State**: React Hook Form
- **Authentication**: Custom useAuth hook
- **Telegram Integration**: useTelegramMock for development

## 🔧 Configuration & Environment

### **Required Environment Variables**
```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/travelmate

# Service Configuration
AUTO_START_MATCHING_SCHEDULER=true  # Auto-start matching on app launch
NODE_ENV=development|production     # Environment mode
```

### **Package.json Scripts**
```json
{
  "scripts": {
    // Development
    "dev": "next dev",
    "dev:https": "next dev --experimental-https",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    
    // Bot Management
    "bot:setup": "node scripts/bot-setup.js",
    "bot:start": "curl -X POST http://localhost:3000/api/bot/start",
    "bot:stop": "curl -X DELETE http://localhost:3000/api/bot/start",
    "bot:status": "curl -X GET http://localhost:3000/api/bot/start",
    "bot:logs": "curl -X GET 'http://localhost:3000/api/bot/logs?recent=true&limit=20'",
    
    // Matching System
    "matching:status": "curl -X GET 'http://localhost:3000/api/matching'",
    "matching:run": "curl -X POST 'http://localhost:3000/api/matching?action=run'",
    "matching:stats": "curl -X GET 'http://localhost:3000/api/matching?action=stats'",
    "matching:mock-users": "curl -X POST 'http://localhost:3000/api/matching?action=create-mock-users'",
    
    // Health Monitoring
    "health:check": "curl -X GET 'http://localhost:3000/api/health'",
    "health:init": "curl -X GET 'http://localhost:3000/api/health?action=init'"
  }
}
```

### **Development Tools**
- **Package Manager**: pnpm (required)
- **Development Server**: Next.js with HTTPS support
- **Database Testing**: MongoDB Memory Server
- **Linting**: ESLint with Next.js configuration
- **Styling**: Tailwind CSS + PostCSS
- **Type Checking**: TypeScript with strict mode

## 🚀 Service Initialization & Deployment

### **Service Initialization Flow**
```
App Startup
    ↓
initializeServices()
    ↓
┌─────────────────┐
│ Bot Service     │ → Telegram webhook setup
├─────────────────┤
│ Scheduler       │ → Cron job initialization
├─────────────────┤
│ Database        │ → MongoDB connection
├─────────────────┤
│ Logger          │ → Logging system setup
└─────────────────┘
    ↓
Health Check → Service monitoring
```

### **Production Deployment Considerations**
- **Webhook Configuration**: HTTPS URL for Telegram webhook
- **Database Connection**: Connection pooling and error handling
- **Cron Jobs**: Persistent scheduling across restarts
- **Error Monitoring**: Comprehensive error tracking
- **Performance**: Service health monitoring
- **Security**: Environment variable protection
- **Scaling**: Service isolation and load balancing

### **Service Dependencies**
```
TelegramBotService
├── Depends on: TELEGRAM_BOT_TOKEN
├── Initializes: Webhook, Command handlers
└── Integrates with: BotLogger, BotNotificationService

MatchingService
├── Depends on: MongoDB connection
├── Initializes: User matching algorithms
└── Integrates with: BotNotificationService, BotLogger

MatchingScheduler
├── Depends on: node-cron, MatchingService
├── Initializes: Scheduled jobs
└── Integrates with: BotLogger

BotNotificationService
├── Depends on: TelegramBotService
├── Initializes: Notification templates
└── Integrates with: BotLogger

BotLogger
├── Depends on: MongoDB connection
├── Initializes: Logging schemas
└── Provides: Analytics and monitoring
```

## 📊 Key Features Implemented

### **✅ Core Features**
- **Telegram Bot Integration** - Full bot command handling and webhook support
- **User Matching Algorithm** - Advanced compatibility scoring based on interests, location, and personality
- **Scheduled Matching** - Automated daily matching with configurable timing
- **Notification System** - Multi-type notifications (matches, tips, reminders)
- **Comprehensive Logging** - Detailed analytics and error tracking
- **Health Monitoring** - Real-time service status and diagnostics

### **✅ User Experience**
- **Profile Management** - Complete user profile creation and editing
- **Settings Management** - Granular notification and matching preferences
- **Onboarding Wizard** - Step-by-step profile setup
- **Mobile-First UI** - Optimized for Telegram Mini App platform
- **Internationalization** - Multi-language support system

### **✅ Development & Operations**
- **Development Environment** - Mock Telegram environment for local development
- **API Documentation** - RESTful API with comprehensive endpoints
- **Error Handling** - Global error boundaries and graceful degradation
- **Testing Support** - Mock user generation and test data
- **Monitoring Tools** - Service health checks and performance metrics

### **✅ Data Management**
- **MongoDB Integration** - Robust database connectivity with Mongoose ODM
- **Data Models** - Well-structured schemas for users, matches, and logs
- **Data Persistence** - Reliable data storage and retrieval
- **Analytics** - User behavior tracking and match success metrics

## 🔄 Matching Algorithm Details

### **Compatibility Scoring Factors**
1. **Common Interests** (40% weight)
   - Shared hobbies and activities
   - Travel preferences
   - Personality traits alignment

2. **Location Compatibility** (30% weight)
   - Same country/region preference
   - Travel destination overlap
   - Geographic proximity

3. **Profile Completeness** (20% weight)
   - Complete profile information
   - Active user status
   - Recent activity

4. **User Preferences** (10% weight)
   - Age range compatibility
   - Gender preferences
   - Custom matching criteria

### **Matching Process Flow**
```
1. Query Active Users
   ↓
2. Apply Location Filters
   ↓
3. Calculate Compatibility Scores
   ↓
4. Rank by Score (minimum threshold: 60%)
   ↓
5. Check Match History (avoid duplicates)
   ↓
6. Create Match Records
   ↓
7. Send Notifications
   ↓
8. Log Results
```

## 📈 Analytics & Monitoring

### **Tracked Metrics**
- **User Engagement**: Profile completions, active users, session duration
- **Matching Performance**: Match success rate, compatibility scores, response rates
- **Bot Interactions**: Command usage, message frequency, user flows
- **System Health**: Service uptime, error rates, response times
- **Notifications**: Delivery rates, open rates, user preferences

### **Logging Categories**
- **User Actions**: Profile updates, settings changes, app interactions
- **Bot Interactions**: Commands, messages, notifications sent
- **System Events**: Service starts/stops, errors, performance issues
- **Matching Events**: Matches created, notifications sent, user responses

## 🛡️ Security & Privacy

### **Data Protection**
- **Environment Variables**: Sensitive data stored securely
- **Database Security**: MongoDB connection string protection
- **API Security**: Input validation and error handling
- **User Privacy**: Minimal data collection, secure data handling

### **Telegram Security**
- **Webhook Verification**: Telegram signature validation
- **Bot Token Security**: Secure token storage and handling
- **User Authentication**: Telegram user ID verification
- **Rate Limiting**: Protection against spam and abuse

This architecture provides a robust, scalable foundation for a travel matching application with comprehensive Telegram integration, automated matching capabilities, and extensive monitoring and analytics systems. 