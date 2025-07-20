import { Schema, model, models, Types, Document } from 'mongoose';
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