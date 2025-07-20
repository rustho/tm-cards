import connectDB from './mongodb';
import mongoose from 'mongoose';
import BotNotificationService from './botNotificationService';
import BotLogger from './botLogger';

// Mock User Schema for matching (you can replace with your real User model)
const MatchingUserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  country: { type: String, required: true },
  region: { type: String },
  interests: [{ type: String }],
  hobbies: [{ type: String }],
  personalityTraits: [{ type: String }],
  placesToVisit: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastMatchTime: { type: Date, default: null },
  totalMatches: { type: Number, default: 0 },
  preferredAgeRange: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 65 }
  },
  preferredGender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MatchingUser = mongoose.models.MatchingUser || mongoose.model('MatchingUser', MatchingUserSchema);

// Match Result Schema
const MatchResultSchema = new mongoose.Schema({
  user1Id: { type: String, required: true },
  user2Id: { type: String, required: true },
  compatibilityScore: { type: Number, required: true },
  matchingFactors: [{
    factor: { type: String },
    score: { type: Number }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'], 
    default: 'pending' 
  },
  notificationSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days
});

MatchResultSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
MatchResultSchema.index({ status: 1, createdAt: -1 });
MatchResultSchema.index({ expiresAt: 1 });

const MatchResult = mongoose.models.MatchResult || mongoose.model('MatchResult', MatchResultSchema);

interface MatchingConfig {
  maxMatchesPerRun: number;
  minCompatibilityScore: number;
  cooldownHours: number;
  enableNotifications: boolean;
}

class MatchingService {
  private static instance: MatchingService;
  private notificationService: BotNotificationService;
  private logger: BotLogger;
  private config: MatchingConfig;
  private isRunning: boolean = false;

  static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  constructor() {
    this.notificationService = BotNotificationService.getInstance();
    this.logger = BotLogger.getInstance();
    this.config = {
      maxMatchesPerRun: 50,
      minCompatibilityScore: 0.6,
      cooldownHours: 24,
      enableNotifications: true
    };
  }

  // Calculate compatibility score between two users
  private calculateCompatibility(user1: any, user2: any): { score: number; factors: any[] } {
    const factors = [];
    let totalScore = 0;
    let weightSum = 0;

    // Age compatibility (weight: 0.2)
    const ageWeight = 0.2;
    const ageDiff = Math.abs(user1.age - user2.age);
    const ageScore = Math.max(0, 1 - ageDiff / 20); // Normalize age difference
    factors.push({ factor: 'age_compatibility', score: ageScore });
    totalScore += ageScore * ageWeight;
    weightSum += ageWeight;

    // Common interests (weight: 0.3)
    const interestsWeight = 0.3;
    const commonInterests = user1.interests.filter((interest: string) => 
      user2.interests.includes(interest)
    );
    const interestScore = commonInterests.length / Math.max(user1.interests.length, user2.interests.length, 1);
    factors.push({ factor: 'common_interests', score: interestScore });
    totalScore += interestScore * interestsWeight;
    weightSum += interestsWeight;

    // Common hobbies (weight: 0.2)
    const hobbiesWeight = 0.2;
    const commonHobbies = user1.hobbies.filter((hobby: string) => 
      user2.hobbies.includes(hobby)
    );
    const hobbyScore = commonHobbies.length / Math.max(user1.hobbies.length, user2.hobbies.length, 1);
    factors.push({ factor: 'common_hobbies', score: hobbyScore });
    totalScore += hobbyScore * hobbiesWeight;
    weightSum += hobbiesWeight;

    // Location compatibility (weight: 0.15)
    const locationWeight = 0.15;
    let locationScore = 0;
    if (user1.country === user2.country) {
      locationScore = user1.region === user2.region ? 1.0 : 0.7;
    } else {
      locationScore = 0.3; // Different countries but still possible
    }
    factors.push({ factor: 'location_compatibility', score: locationScore });
    totalScore += locationScore * locationWeight;
    weightSum += locationWeight;

    // Travel destinations (weight: 0.15)
    const destinationWeight = 0.15;
    const commonDestinations = user1.placesToVisit.filter((place: string) => 
      user2.placesToVisit.includes(place)
    );
    const destinationScore = commonDestinations.length / 
      Math.max(user1.placesToVisit.length, user2.placesToVisit.length, 1);
    factors.push({ factor: 'travel_destinations', score: destinationScore });
    totalScore += destinationScore * destinationWeight;
    weightSum += destinationWeight;

    const finalScore = weightSum > 0 ? totalScore / weightSum : 0;

    return {
      score: Math.round(finalScore * 100) / 100,
      factors: factors.map(f => ({
        ...f,
        score: Math.round(f.score * 100) / 100
      }))
    };
  }

  // Check if users are compatible based on preferences
  private areUsersCompatible(user1: any, user2: any): boolean {
    // Age preference check
    if (user1.age < user2.preferredAgeRange.min || user1.age > user2.preferredAgeRange.max) {
      return false;
    }
    if (user2.age < user1.preferredAgeRange.min || user2.age > user1.preferredAgeRange.max) {
      return false;
    }

    // Gender preference check
    if (user1.preferredGender !== 'any' && user1.preferredGender !== user2.gender) {
      return false;
    }
    if (user2.preferredGender !== 'any' && user2.preferredGender !== user1.gender) {
      return false;
    }

    return true;
  }

  // Get eligible users for matching
  private async getEligibleUsers(): Promise<any[]> {
    await connectDB();
    
    const cooldownTime = new Date(Date.now() - this.config.cooldownHours * 60 * 60 * 1000);
    
    const users = await MatchingUser.find({
      isActive: true,
      $or: [
        { lastMatchTime: { $lt: cooldownTime } },
        { lastMatchTime: null }
      ]
    }).lean();

    return users;
  }

  // Create mock users for testing (remove when you have real users)
  async createMockUsers(count: number = 10) {
    await connectDB();
    
    const mockUsers = [];
    const countries = ['Vietnam', 'Thailand', 'Indonesia', 'Sri Lanka'];
    const regions = {
      'Vietnam': ['Da Nang', 'Nha Trang', 'Ho Chi Minh City'],
      'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai'],
      'Indonesia': ['Bali', 'Jakarta', 'Yogyakarta'],
      'Sri Lanka': ['Colombo', 'Kandy', 'Galle']
    };
    const interests = ['Photography', 'Hiking', 'Food', 'Art', 'Music', 'Sports', 'Reading', 'Travel', 'Dancing', 'Cooking'];
    const hobbies = ['Swimming', 'Running', 'Yoga', 'Cycling', 'Painting', 'Gaming', 'Writing', 'Meditation'];
    const destinations = ['Bali', 'Thailand', 'Vietnam', 'Japan', 'Europe', 'Australia'];

    for (let i = 1; i <= count; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const region = regions[country][Math.floor(Math.random() * regions[country].length)];
      
      mockUsers.push({
        telegramId: `mock_user_${i}`,
        username: `traveler${i}`,
        name: `User ${i}`,
        age: 20 + Math.floor(Math.random() * 30),
        gender: ['male', 'female'][Math.floor(Math.random() * 2)],
        country,
        region,
        interests: interests.slice(0, 3 + Math.floor(Math.random() * 4)),
        hobbies: hobbies.slice(0, 2 + Math.floor(Math.random() * 3)),
        placesToVisit: destinations.slice(0, 2 + Math.floor(Math.random() * 3)),
        preferredAgeRange: {
          min: 18 + Math.floor(Math.random() * 10),
          max: 40 + Math.floor(Math.random() * 20)
        },
        preferredGender: ['male', 'female', 'any'][Math.floor(Math.random() * 3)]
      });
    }

    try {
      await MatchingUser.insertMany(mockUsers);
      console.log(`✅ Created ${count} mock users for testing`);
      return { success: true, count };
    } catch (error) {
      console.error('Error creating mock users:', error);
      return { success: false, error };
    }
  }

  // Run the matching algorithm
  async runMatching(): Promise<{
    success: boolean;
    matchesCreated: number;
    notificationsSent: number;
    errors: any[];
  }> {
    if (this.isRunning) {
      console.log('⏳ Matching service is already running');
      return { success: false, matchesCreated: 0, notificationsSent: 0, errors: ['Service already running'] };
    }

    this.isRunning = true;
    console.log('🚀 Starting matching service...');

    const results = {
      success: true,
      matchesCreated: 0,
      notificationsSent: 0,
      errors: []
    };

    try {
      await connectDB();
      
      // Get eligible users
      const users = await this.getEligibleUsers();
      console.log(`👥 Found ${users.length} eligible users for matching`);

      if (users.length < 2) {
        console.log('ℹ️ Not enough users for matching');
        return results;
      }

      const potentialMatches = [];

      // Generate all possible user pairs
      for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
          const user1 = users[i];
          const user2 = users[j];

          // Skip if users are the same or already matched
          if (user1.telegramId === user2.telegramId) continue;

          // Check if already matched
          const existingMatch = await MatchResult.findOne({
            $or: [
              { user1Id: user1.telegramId, user2Id: user2.telegramId },
              { user1Id: user2.telegramId, user2Id: user1.telegramId }
            ]
          });

          if (existingMatch) continue;

          // Check compatibility preferences
          if (!this.areUsersCompatible(user1, user2)) continue;

          // Calculate compatibility score
          const compatibility = this.calculateCompatibility(user1, user2);

          if (compatibility.score >= this.config.minCompatibilityScore) {
            potentialMatches.push({
              user1,
              user2,
              compatibility
            });
          }
        }
      }

      // Sort by compatibility score (highest first)
      potentialMatches.sort((a, b) => b.compatibility.score - a.compatibility.score);

      // Limit matches per run
      const matchesToCreate = potentialMatches.slice(0, this.config.maxMatchesPerRun);

      // Create matches and send notifications
      for (const match of matchesToCreate) {
        try {
          // Create match record
          const matchResult = new MatchResult({
            user1Id: match.user1.telegramId,
            user2Id: match.user2.telegramId,
            compatibilityScore: match.compatibility.score,
            matchingFactors: match.compatibility.factors
          });

          await matchResult.save();
          results.matchesCreated++;

          // Update user last match times
          await MatchingUser.updateMany(
            { telegramId: { $in: [match.user1.telegramId, match.user2.telegramId] } },
            { 
              lastMatchTime: new Date(),
              $inc: { totalMatches: 1 }
            }
          );

          // Send notifications if enabled
          if (this.config.enableNotifications) {
            try {
              // Notify user1 about user2
              await this.notificationService.notifyNewMatch(match.user1.telegramId, {
                id: matchResult._id.toString(),
                name: match.user2.name,
                country: match.user2.country,
                interests: match.user2.interests,
                photo: undefined // Add photo logic later
              });

              // Notify user2 about user1
              await this.notificationService.notifyNewMatch(match.user2.telegramId, {
                id: matchResult._id.toString(),
                name: match.user1.name,
                country: match.user1.country,
                interests: match.user1.interests,
                photo: undefined
              });

              // Mark notifications as sent
              await MatchResult.updateOne(
                { _id: matchResult._id },
                { notificationSent: true }
              );

              results.notificationsSent += 2;
              console.log(`🔔 Notifications sent for match: ${match.user1.name} ↔ ${match.user2.name}`);

            } catch (notificationError) {
              console.error('Error sending notifications:', notificationError);
              results.errors.push(`Notification error for match ${matchResult._id}: ${notificationError}`);
            }
          }

          console.log(`✅ Created match: ${match.user1.name} ↔ ${match.user2.name} (Score: ${match.compatibility.score})`);

        } catch (matchError) {
          console.error('Error creating match:', matchError);
          results.errors.push(`Match creation error: ${matchError}`);
        }
      }

      console.log(`🎉 Matching completed: ${results.matchesCreated} matches created, ${results.notificationsSent} notifications sent`);

    } catch (error) {
      console.error('Error in matching service:', error);
      results.success = false;
      results.errors.push(error);
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  // Get matching statistics
  async getMatchingStats() {
    try {
      await connectDB();

      const [
        totalUsers,
        activeUsers,
        totalMatches,
        pendingMatches,
        matchesToday
      ] = await Promise.all([
        MatchingUser.countDocuments({}),
        MatchingUser.countDocuments({ isActive: true }),
        MatchResult.countDocuments({}),
        MatchResult.countDocuments({ status: 'pending' }),
        MatchResult.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      ]);

      const avgCompatibilityScore = await MatchResult.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$compatibilityScore' } } }
      ]);

      return {
        totalUsers,
        activeUsers,
        totalMatches,
        pendingMatches,
        matchesToday,
        avgCompatibilityScore: avgCompatibilityScore[0]?.avgScore || 0,
        isRunning: this.isRunning,
        config: this.config
      };

    } catch (error) {
      console.error('Error getting matching stats:', error);
      return null;
    }
  }

  // Clean expired matches
  async cleanupExpiredMatches() {
    try {
      await connectDB();
      
      const result = await MatchResult.updateMany(
        {
          status: 'pending',
          expiresAt: { $lt: new Date() }
        },
        { status: 'expired' }
      );

      console.log(`🧹 Marked ${result.modifiedCount} matches as expired`);
      return result.modifiedCount;

    } catch (error) {
      console.error('Error cleaning expired matches:', error);
      return 0;
    }
  }

  // Update matching configuration
  updateConfig(newConfig: Partial<MatchingConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Matching configuration updated:', this.config);
  }

  // Get configuration
  getConfig() {
    return { ...this.config };
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastRun: null // You can implement this if needed
    };
  }
}

export default MatchingService; 