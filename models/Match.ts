import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  user1: {
    type: Number, // telegramId
    required: true,
  },
  user2: {
    type: Number, // telegramId
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "current", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

export default mongoose.models.Match || mongoose.model("Match", MatchSchema); 