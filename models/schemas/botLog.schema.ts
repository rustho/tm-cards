import { Schema, model, models, Types, Document } from 'mongoose';
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