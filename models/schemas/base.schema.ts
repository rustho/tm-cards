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