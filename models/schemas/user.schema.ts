import { Schema, model, models, Document } from 'mongoose';
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