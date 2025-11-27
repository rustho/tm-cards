import mongoose from "mongoose";

// Enhanced User Schema for sophisticated matching
const MatchingUserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String },
  name: { type: String, required: true },

  // Demographics
  age: { type: Number },
  dateOfBirth: { type: String }, // Storing as string from Wizard (e.g. "DD.MM.YYYY" or ISO)
  gender: { type: String, enum: ["male", "female", "other"] },

  // Location
  country: { type: String, required: true },
  region: { type: String },

  // Profile Details
  interests: [{ type: String }],
  hobbies: [{ type: String }],
  personalityTraits: [{ type: String }],
  placesToVisit: [{ type: String }],
  instagram: { type: String },
  photo: { type: String },
  announcement: { type: String }, // Request/Bio

  // System Status
  isActive: { type: Boolean, default: true },
  lastMatchTime: { type: Date, default: null },
  totalMatches: { type: Number, default: 0 },
  previousMatches: [{ type: String }], // Track previous match IDs
  skip: { type: Boolean, default: false }, // Allow users to skip matching rounds

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
