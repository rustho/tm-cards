import mongoose from "mongoose";

// Enhanced User Schema for sophisticated matching
const MatchingUserSchema = new mongoose.Schema({
  // Mandatory
  telegramId: { type: String, required: true, unique: true },

  // Optional Step-by-Step Fields
  username: { type: String },
  name: { type: String }, // Made optional

  // Demographics
  age: { type: Number },
  dateOfBirth: { type: String },
  gender: { type: String, enum: ["male", "female", "other"] },

  // Location
  country: { type: String }, // Made optional
  region: { type: String },

  // Profile Details
  interests: [{ type: String }],
  hobbies: [{ type: String }],
  personalityTraits: [{ type: String }],
  placesToVisit: [{ type: String }],
  instagram: { type: String },
  photo: { type: String },
  announcement: { type: String },

  // System Status
  isActive: { type: Boolean, default: true },
  lastMatchTime: { type: Date, default: null },
  totalMatches: { type: Number, default: 0 },
  previousMatches: [{ type: String }],
  skip: { type: Boolean, default: false },

  // Matching Preferences
  preferredAgeRange: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 65 },
  },
  preferredGender: {
    type: String,
    enum: ["male", "female", "any"],
    default: "any",
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp on save
MatchingUserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const MatchingUser =
  mongoose.models.MatchingUser ||
  mongoose.model("MatchingUser", MatchingUserSchema);

export default MatchingUser;
