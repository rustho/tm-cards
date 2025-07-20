import { Schema, model, models, Types, Document } from 'mongoose';
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