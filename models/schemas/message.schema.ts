import { Schema, model, models, Types, Document } from 'mongoose';
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