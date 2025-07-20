# 🗺️ TravelMate MongoDB Integration Implementation Plan - Simplified

## 📋 Overview

This document outlines a **simplified** implementation plan for integrating MongoDB across all TravelMate services, using a denormalized approach optimized for read performance and development speed.

## 🎯 Implementation Goals

1. **Simplified Schema Design** - Fewer collections with embedded data
2. **Fast Development** - Reduced complexity and joins
3. **Read Performance** - Optimized for typical bot usage patterns
4. **Easy Maintenance** - Straightforward data model
5. **Scalable Foundation** - Can be normalized later if needed

## 📅 Implementation Timeline

### **Phase 1: Core Setup (Week 1)**
- Database connection and configuration
- 6 core schemas implementation
- Basic CRUD operations

### **Phase 2: Services (Week 2)**
- User and profile services
- Matching and conversation services
- API integration

### **Phase 3: Testing & Deployment (Week 3)**
- Testing and optimization
- Production deployment

## 🗄️ Simplified Database Design

### **Core Collections (6 collections only)**

```
TravelMate Database (Simplified)
├── 👤 users                    # Users + settings + preferences
├── 👤 profiles                 # Complete profiles + interests + location
├── 🤝 matches                  # Match relationships
├── 💬 conversations            # Chat conversations
├── 📄 messages                 # Individual messages
└── 📋 bot_logs                 # Bot interaction logs
```

## 🏗️ Detailed Schema Implementation

### **1. Users Collection** 
*All user data, settings, and preferences in one place*

```typescript
// models/schemas/user.schema.ts
import { Schema, model, models } from 'mongoose';
import { createBaseSchema } from './base.schema';

export interface IUser extends Document {
  // Basic Telegram Data
  telegramId: string;
  chatId?: string;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
  
  // User Status
  status: 'active' | 'inactive' | 'banned' | 'pending';
  isOnline: boolean;
  lastSeen: Date;
  registrationDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  
  // Settings (embedded - based on actual NotificationSettings and MatchingScheduleSettings)
  settings: {
    // Notification Preferences (from actual NotificationSettings)
    notifications: {
      newMatches: boolean;
      messages: boolean;
      profileViews: boolean;
      gameInvites: boolean;
      weeklyDigest: boolean;
    };
    
    // Matching Schedule (from actual MatchingScheduleSettings)
    matchingSchedule: {
      option: 'active' | 'pause_week' | 'pause_month' | 'pause_custom' | 'pause_indefinite';
      customDate?: string;
      resumeDate?: string;
      lastUpdated: string;
    };
    
    // App Preferences
    app: {
      language: string;
      theme: 'light' | 'dark' | 'auto';
    };
  };
  
  // Statistics (embedded)
  stats: {
    profileViews: number;
    matchesReceived: number;
    matchesGiven: number;
    conversationsStarted: number;
    lastMatchDate?: Date;
  };
}

const userSchemaDefinition = {
  // Basic Telegram Data
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  chatId: {
    type: String,
    sparse: true
  },
  username: {
    type: String,
    sparse: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  languageCode: {
    type: String,
    default: 'en'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // User Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned', 'pending'],
    default: 'active',
    index: true
  },
  isOnline: {
    type: Boolean,
    default: false,
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Settings (embedded)
  settings: {
    notifications: {
      newMatches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      profileViews: { type: Boolean, default: false },
      gameInvites: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true }
    },
    matchingSchedule: {
      option: { 
        type: String, 
        enum: ['active', 'pause_week', 'pause_month', 'pause_custom', 'pause_indefinite'], 
        default: 'active' 
      },
      customDate: String,
      resumeDate: String,
      lastUpdated: { type: String, default: () => new Date().toISOString() }
    },
    app: {
      language: { type: String, default: 'en' },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' }
    }
  },
  
  // Statistics (embedded)
  stats: {
    profileViews: { type: Number, default: 0 },
    matchesReceived: { type: Number, default: 0 },
    matchesGiven: { type: Number, default: 0 },
    conversationsStarted: { type: Number, default: 0 },
    lastMatchDate: Date
  }
};

const userSchema = createBaseSchema(userSchemaDefinition);

// Indexes
userSchema.index({ telegramId: 1 }, { unique: true });
userSchema.index({ status: 1, isOnline: 1 });
userSchema.index({ lastSeen: -1 });
userSchema.index({ 'settings.matchingSchedule.option': 1 });

export const User = models.User || model<IUser>('User', userSchema);
```

### **2. Profiles Collection**
*Complete profile data with embedded interests and location (based on actual ProfileData)*

```typescript
// models/schemas/profile.schema.ts
import { Schema, model, models, Types } from 'mongoose';
import { createBaseSchema } from './base.schema';

export interface IProfile extends Document {
  userId: Types.ObjectId;
  
  // Basic Info (from actual ProfileData)
  name: string;                 // from Profile.name
  age: string;                  // from ProfileData.age (string, not number!)
  occupation: string;           // from ProfileData.occupation
  about: string;               // from ProfileData.about
  
  // Location (from actual Profile)
  country: string;             // from Profile.country
  region: string;              // from Profile.region
  
  // Interests & Personality (from actual ProfileData arrays)
  interests: string[];         // from ProfileData.interests (strings, not ObjectIds!)
  hobbies: string[];          // from ProfileData.hobbies
  personalityTraits: string[]; // from ProfileData.personalityTraits
  
  // Travel & Social (from actual Profile)
  placesToVisit: string;       // from Profile.placesToVisit  
  instagram: string;           // from Profile.instagram
  announcement: string;        // from Profile.announcement (looking for)
  
  // Profile Status & Media
  photo: string;              // from Profile.photo
  profile: string;            // from Profile.profile (seems to be bio/description)
  
  // Profile Metadata
  isComplete: boolean;
  completionPercentage: number;
  isActive: boolean;
  lastProfileUpdate: Date;
}

const profileSchemaDefinition = {
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Basic Info (from actual implementation)
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  age: {
    type: String,  // String, not Number! (as per actual implementation)
    required: true,
    validate: {
      validator: function(v: string) {
        const age = parseInt(v);
        return age >= 18 && age <= 100;
      },
      message: 'Age must be between 18 and 100'
    }
  },
  occupation: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  about: {
    type: String,
    required: true,
    trim: true,
    maxlength: 284  // Max chars as per Step8About component
  },
  
  // Location (from actual Profile interface)
  country: {
    type: String,
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    index: true
  },
  
  // Interests & Personality (arrays of strings)
  interests: {
    type: [String],
    required: true,
    validate: [
      {
        validator: function(v: string[]) { return v.length > 0; },
        message: 'At least one interest is required'
      },
      {
        validator: function(v: string[]) { return v.length <= 20; },
        message: 'Maximum 20 interests allowed'
      }
    ]
  },
  hobbies: {
    type: [String],
    validate: [arrayLimit20, 'Maximum 20 hobbies allowed']
  },
  personalityTraits: {
    type: [String],
    validate: [arrayLimit10, 'Maximum 10 personality traits allowed']
  },
  
  // Travel & Social
  placesToVisit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  instagram: {
    type: String,
    trim: true,
    maxlength: 50
  },
  announcement: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Profile Status & Media
  photo: {
    type: String,
    trim: true
  },
  profile: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Profile Metadata
  isComplete: {
    type: Boolean,
    default: false,
    index: true
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastProfileUpdate: {
    type: Date,
    default: Date.now
  }
};

// Validation functions
function arrayLimit20(val: string[]) {
  return val.length <= 20;
}

function arrayLimit10(val: string[]) {
  return val.length <= 10;
}

const profileSchema = createBaseSchema(profileSchemaDefinition);

// Indexes for matching
profileSchema.index({ country: 1, region: 1 });
profileSchema.index({ isActive: 1, isComplete: 1 });
profileSchema.index({ interests: 1 });

// Calculate completion percentage before save
profileSchema.pre('save', function(next) {
  const requiredFields = ['name', 'age', 'occupation', 'about', 'country', 'region', 'interests', 'placesToVisit', 'announcement'];
  const optionalFields = ['hobbies', 'personalityTraits', 'instagram', 'photo', 'profile'];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  // Check required fields
  requiredFields.forEach(field => {
    const value = this.get(field);
    if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
      completedRequired++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const value = this.get(field);
    if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
      completedOptional++;
    }
  });
  
  // Calculate percentage (80% for required, 20% for optional)
  this.completionPercentage = Math.round(
    (completedRequired / requiredFields.length) * 80 + 
    (completedOptional / optionalFields.length) * 20
  );
  
  this.isComplete = this.completionPercentage >= 70; // Profile is complete at 70%
  this.lastProfileUpdate = new Date();
  
  next();
});

export const Profile = models.Profile || model<IProfile>('Profile', profileSchema);
```

### **3. Matches Collection**
*Simplified match relationships*

```typescript
// models/schemas/match.schema.ts
import { Schema, model, models, Types } from 'mongoose';
import { createBaseSchema } from './base.schema';

export interface IMatch extends Document {
  user1Id: Types.ObjectId;
  user2Id: Types.ObjectId;
  
  // Match Quality
  compatibilityScore: number;
  matchingReasons: string[];    // ['same_country', 'common_interests', 'similar_age']
  
  // Match Status
  status: 'pending' | 'mutual_like' | 'declined' | 'expired';
  user1Action: 'pending' | 'liked' | 'passed';
  user2Action: 'pending' | 'liked' | 'passed';
  
  // Conversation
  conversationId?: Types.ObjectId;
  
  // Metadata
  expiresAt: Date;
  matchedAt: Date;
  lastActionAt?: Date;
  
  // Notifications
  notificationsSent: boolean;
}

const matchSchemaDefinition = {
  user1Id: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  user2Id: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Match Quality
  compatibilityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  matchingReasons: [String],
  
  // Match Status
  status: {
    type: String,
    enum: ['pending', 'mutual_like', 'declined', 'expired'],
    default: 'pending',
    index: true
  },
  user1Action: {
    type: String,
    enum: ['pending', 'liked', 'passed'],
    default: 'pending'
  },
  user2Action: {
    type: String,
    enum: ['pending', 'liked', 'passed'],
    default: 'pending'
  },
  
  // Conversation
  conversationId: {
    type: Types.ObjectId,
    ref: 'Conversation'
  },
  
  // Metadata
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  lastActionAt: Date,
  
  // Notifications
  notificationsSent: {
    type: Boolean,
    default: false
  }
};

const matchSchema = createBaseSchema(matchSchemaDefinition);

// Compound indexes
matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
matchSchema.index({ status: 1, expiresAt: 1 });
matchSchema.index({ compatibilityScore: -1 });

export const Match = models.Match || model<IMatch>('Match', matchSchema);
```

### **4. Conversations Collection**
*Chat conversations between matched users*

```typescript
// models/schemas/conversation.schema.ts
import { Schema, model, models, Types } from 'mongoose';
import { createBaseSchema } from './base.schema';

export interface IConversation extends Document {
  matchId: Types.ObjectId;
  participants: Types.ObjectId[];
  
  // Conversation Status
  status: 'active' | 'archived' | 'blocked';
  
  // Message Info
  lastMessage?: {
    content: string;
    senderId: Types.ObjectId;
    sentAt: Date;
    type: 'text' | 'image' | 'location';
  };
  
  messageCount: number;
  
  // Read Status
  readStatus: Map<string, {
    lastReadAt: Date;
    unreadCount: number;
  }>;
  
  // Metadata
  startedAt: Date;
  lastActivityAt: Date;
}

const conversationSchemaDefinition = {
  matchId: {
    type: Types.ObjectId,
    ref: 'Match',
    required: true,
    unique: true,
    index: true
  },
  participants: [{
    type: Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active',
    index: true
  },
  
  lastMessage: {
    content: String,
    senderId: {
      type: Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date,
    type: {
      type: String,
      enum: ['text', 'image', 'location'],
      default: 'text'
    }
  },
  
  messageCount: {
    type: Number,
    default: 0
  },
  
  readStatus: {
    type: Map,
    of: {
      lastReadAt: Date,
      unreadCount: { type: Number, default: 0 }
    }
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true
  }
};

const conversationSchema = createBaseSchema(conversationSchemaDefinition);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ status: 1, lastActivityAt: -1 });

export const Conversation = models.Conversation || model<IConversation>('Conversation', conversationSchema);
```

### **5. Messages Collection**
*Individual messages*

```typescript
// models/schemas/message.schema.ts
import { Schema, model, models, Types } from 'mongoose';
import { createBaseSchema } from './base.schema';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  
  // Message Content
  content: string;
  type: 'text' | 'image' | 'location' | 'system';
  
  // Attachments (if any)
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    filename?: string;
    size?: number;
  }>;
  
  // Location data (if type is location)
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  
  // Message Status
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  
  // Metadata
  sentAt: Date;
}

const messageSchemaDefinition = {
  conversationId: {
    type: Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  senderId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 4000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text'
  },
  
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file']
    },
    url: String,
    filename: String,
    size: Number
  }],
  
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  }
};

const messageSchema = createBaseSchema(messageSchemaDefinition);

// Compound indexes
messageSchema.index({ conversationId: 1, sentAt: -1 });
messageSchema.index({ senderId: 1, sentAt: -1 });

export const Message = models.Message || model<IMessage>('Message', messageSchema);
```

### **6. Bot Logs Collection**
*Simplified bot interaction logging*

```typescript
// models/schemas/botLog.schema.ts
import { Schema, model, models, Types } from 'mongoose';
import { createBaseSchema } from './base.schema';

export interface IBotLog extends Document {
  // User Info
  userId?: Types.ObjectId;
  telegramId?: string;
  chatId?: string;
  
  // Event Info
  type: 'command' | 'message' | 'callback' | 'error' | 'notification' | 'action';
  event: string;              // e.g., 'start_command', 'profile_update', 'match_like'
  
  // Data
  data?: any;                 // Event-specific data
  result?: any;               // Action result
  
  // Status
  success: boolean;
  errorMessage?: string;
  executionTime?: number;     // milliseconds
  
  // Metadata
  timestamp: Date;
  source: 'bot' | 'webapp' | 'api';
  userAgent?: string;
}

const botLogSchemaDefinition = {
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    index: true
  },
  telegramId: {
    type: String,
    index: true
  },
  chatId: String,
  
  type: {
    type: String,
    enum: ['command', 'message', 'callback', 'error', 'notification', 'action'],
    required: true,
    index: true
  },
  event: {
    type: String,
    required: true,
    index: true
  },
  
  data: Schema.Types.Mixed,
  result: Schema.Types.Mixed,
  
  success: {
    type: Boolean,
    required: true,
    index: true
  },
  errorMessage: String,
  executionTime: Number,
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    enum: ['bot', 'webapp', 'api'],
    default: 'bot'
  },
  userAgent: String
};

const botLogSchema = createBaseSchema(botLogSchemaDefinition);

// TTL index - automatically delete logs older than 90 days
botLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Compound indexes
botLogSchema.index({ type: 1, timestamp: -1 });
botLogSchema.index({ success: 1, timestamp: -1 });
botLogSchema.index({ userId: 1, timestamp: -1 });

export const BotLog = models.BotLog || model<IBotLog>('BotLog', botLogSchema);
```

## 🏗️ Base Schema

```typescript
// models/schemas/base.schema.ts
import { Schema } from 'mongoose';

export function createBaseSchema(definition: any) {
  const schema = new Schema({
    ...definition,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  return schema;
}
```

## 🏗️ Simplified Service Implementation

### **Enhanced Database Service**

```typescript
// lib/services/database.service.ts
import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

export class DatabaseService<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error: any) {
      throw new Error(`Create operation failed: ${error.message}`);
    }
  }

  async findById(id: string, populate?: string[]): Promise<T | null> {
    try {
      let query = this.model.findById(id);
      if (populate) {
        populate.forEach(field => query = query.populate(field));
      }
      return await query.exec();
    } catch (error: any) {
      throw new Error(`FindById operation failed: ${error.message}`);
    }
  }

  async findOne(filter: FilterQuery<T>, populate?: string[]): Promise<T | null> {
    try {
      let query = this.model.findOne(filter);
      if (populate) {
        populate.forEach(field => query = query.populate(field));
      }
      return await query.exec();
    } catch (error: any) {
      throw new Error(`FindOne operation failed: ${error.message}`);
    }
  }

  async find(
    filter: FilterQuery<T> = {}, 
    options: QueryOptions = {},
    populate?: string[]
  ): Promise<T[]> {
    try {
      let query = this.model.find(filter, null, options);
      if (populate) {
        populate.forEach(field => query = query.populate(field));
      }
      return await query.exec();
    } catch (error: any) {
      throw new Error(`Find operation failed: ${error.message}`);
    }
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(
        id, 
        { ...update, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      ).exec();
    } catch (error: any) {
      throw new Error(`UpdateById operation failed: ${error.message}`);
    }
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOneAndUpdate(
        filter,
        { ...update, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec();
    } catch (error: any) {
      throw new Error(`UpdateOne operation failed: ${error.message}`);
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error: any) {
      throw new Error(`DeleteById operation failed: ${error.message}`);
    }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error: any) {
      throw new Error(`Count operation failed: ${error.message}`);
    }
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const result = await this.model.findOne(filter).select('_id').lean().exec();
      return !!result;
    } catch (error: any) {
      throw new Error(`Exists operation failed: ${error.message}`);
    }
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    try {
      return await this.model.aggregate(pipeline).exec();
    } catch (error: any) {
      throw new Error(`Aggregation operation failed: ${error.message}`);
    }
  }
}
```

### **User Service with Actual Settings**

```typescript
// lib/services/user.service.ts
import { User, IUser } from '../models/schemas/user.schema';
import { DatabaseService } from './database.service';
import { NotificationSettings, MatchingScheduleSettings } from '@/models/types';

export class UserService extends DatabaseService<IUser> {
  constructor() {
    super(User);
  }

  async findByTelegramId(telegramId: string): Promise<IUser | null> {
    return await this.findOne({ telegramId });
  }

  async createUser(userData: {
    telegramId: string;
    firstName: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    chatId?: string;
  }): Promise<IUser> {
    // Default settings based on actual implementation
    const defaultSettings = {
      notifications: {
        newMatches: true,
        messages: true,
        profileViews: false,
        gameInvites: true,
        weeklyDigest: true
      },
      matchingSchedule: {
        option: 'active' as const,
        lastUpdated: new Date().toISOString()
      },
      app: {
        language: userData.languageCode || 'en',
        theme: 'light' as const
      }
    };

    const defaultStats = {
      profileViews: 0,
      matchesReceived: 0,
      matchesGiven: 0,
      conversationsStarted: 0
    };

    return await this.create({
      ...userData,
      registrationDate: new Date(),
      lastSeen: new Date(),
      isOnline: true,
      settings: defaultSettings,
      stats: defaultStats
    });
  }

  async updateNotificationSettings(
    telegramId: string, 
    notificationSettings: NotificationSettings
  ): Promise<IUser | null> {
    return await this.updateOne(
      { telegramId },
      { 'settings.notifications': notificationSettings }
    );
  }

  async updateMatchingSchedule(
    telegramId: string,
    matchingSchedule: MatchingScheduleSettings
  ): Promise<IUser | null> {
    return await this.updateOne(
      { telegramId },
      { 'settings.matchingSchedule': matchingSchedule }
    );
  }

  async updateOnlineStatus(telegramId: string, isOnline: boolean): Promise<IUser | null> {
    return await this.updateOne(
      { telegramId },
      { 
        isOnline, 
        lastSeen: new Date()
      }
    );
  }

  async getActiveMatchingUsers(): Promise<IUser[]> {
    return await this.find({
      status: 'active',
      'settings.matchingSchedule.option': 'active'
    });
  }

  async incrementStat(telegramId: string, statField: keyof IUser['stats']): Promise<void> {
    await this.model.updateOne(
      { telegramId },
      { $inc: { [`stats.${statField}`]: 1 } }
    );
  }
}

export const userService = new UserService();
```

### **Profile Service Based on Actual ProfileData**

```typescript
// lib/services/profile.service.ts
import { Profile, IProfile } from '../models/schemas/profile.schema';
import { DatabaseService } from './database.service';
import { Types } from 'mongoose';
import type { ProfileData } from '@/models/types';

export class ProfileService extends DatabaseService<IProfile> {
  constructor() {
    super(Profile);
  }

  async findByUserId(userId: string): Promise<IProfile | null> {
    return await this.findOne({ userId: new Types.ObjectId(userId) });
  }

  async createProfile(userId: string, profileData: Partial<ProfileData>): Promise<IProfile> {
    return await this.create({
      userId: new Types.ObjectId(userId),
      name: profileData.name || '',
      age: profileData.age || '',
      occupation: profileData.occupation || '',
      about: profileData.about || '',
      country: profileData.country || '',
      region: profileData.region || '',
      interests: profileData.interests || [],
      hobbies: profileData.hobbies || [],
      personalityTraits: profileData.personalityTraits || [],
      placesToVisit: profileData.placesToVisit || '',
      instagram: profileData.instagram || '',
      announcement: profileData.announcement || '',
      photo: profileData.photo || '',
      profile: profileData.profile || ''
    });
  }

  async updateProfile(userId: string, profileData: Partial<ProfileData>): Promise<IProfile | null> {
    return await this.updateOne(
      { userId: new Types.ObjectId(userId) },
      profileData
    );
  }

  async getMatchingProfiles(filters: {
    excludeUserId: string;
    country?: string;
    interests?: string[];
    limit?: number;
  }): Promise<IProfile[]> {
    const query: any = {
      userId: { $ne: new Types.ObjectId(filters.excludeUserId) },
      isActive: true,
      isComplete: true
    };

    // Location filter
    if (filters.country) {
      query.country = filters.country;
    }

    // Interest filter (using array intersection)
    if (filters.interests && filters.interests.length > 0) {
      query.interests = { $in: filters.interests };
    }

    return await this.find(
      query,
      { 
        limit: filters.limit || 50,
        sort: { lastProfileUpdate: -1 }
      }
    );
  }

  async calculateCompatibility(profile1: IProfile, profile2: IProfile): Promise<{
    score: number;
    reasons: string[];
  }> {
    let score = 0;
    const reasons: string[] = [];

    // Location compatibility (30 points)
    if (profile1.country === profile2.country) {
      score += 20;
      reasons.push('same_country');
      
      if (profile1.region === profile2.region) {
        score += 10;
        reasons.push('same_region');
      }
    }

    // Age compatibility (20 points)
    const age1 = parseInt(profile1.age);
    const age2 = parseInt(profile2.age);
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 5) {
      score += 20;
      reasons.push('similar_age');
    } else if (ageDiff <= 10) {
      score += 10;
      reasons.push('compatible_age');
    }

    // Interest compatibility (30 points)
    const commonInterests = profile1.interests.filter(interest =>
      profile2.interests.includes(interest)
    );
    if (commonInterests.length > 0) {
      score += Math.min(commonInterests.length * 5, 30);
      reasons.push('common_interests');
    }

    // Hobby compatibility (20 points)
    const commonHobbies = profile1.hobbies.filter(hobby =>
      profile2.hobbies.includes(hobby)
    );
    if (commonHobbies.length > 0) {
      score += Math.min(commonHobbies.length * 10, 20);
      reasons.push('similar_hobbies');
    }

    return { score: Math.min(score, 100), reasons };
  }
}

export const profileService = new ProfileService();
```

## 📦 Model Export Structure

```typescript
// models/index.ts
export { User } from './schemas/user.schema';
export { Profile } from './schemas/profile.schema';
export { Match } from './schemas/match.schema';
export { Conversation } from './schemas/conversation.schema';
export { Message } from './schemas/message.schema';
export { BotLog } from './schemas/botLog.schema';

export type { IUser } from './schemas/user.schema';
export type { IProfile } from './schemas/profile.schema';
export type { IMatch } from './schemas/match.schema';
export type { IConversation } from './schemas/conversation.schema';
export type { IMessage } from './schemas/message.schema';
export type { IBotLog } from './schemas/botLog.schema';
```

## 🚀 Quick Setup Commands

```bash
# Create the directory structure
mkdir -p models/schemas lib/services

# Install additional dependencies
npm install mongoose @types/mongoose mongodb-memory-server

# Environment variable
MONGODB_URI=mongodb://localhost:27017/travelmate
```

This simplified approach gives you:

✅ **6 collections based on actual implementation**  
✅ **Fields that match your existing ProfileData and settings**  
✅ **No fictional fields or over-engineered structure**  
✅ **Direct mapping to your current User, Profile, and Settings types**  
✅ **Age as string (as per your implementation)**  
✅ **Actual notification and matching schedule settings**  
✅ **Simple relationship patterns that work with your bot**

The schemas now perfectly match what you're actually collecting in your wizard steps and settings pages! 