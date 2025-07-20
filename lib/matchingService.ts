import connectDB from "./mongodb";
import mongoose from "mongoose";
import BotNotificationService from "./botNotificationService";
import BotLogger from "./botLogger";

// Enhanced User Schema for sophisticated matching
const MatchingUserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String },
  name: { type: String, required: true },
  age: { type: Number },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  country: { type: String, required: true },
  region: { type: String },
  interests: [{ type: String }],
  hobbies: [{ type: String }],
  personalityTraits: [{ type: String }],
  placesToVisit: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastMatchTime: { type: Date, default: null },
  totalMatches: { type: Number, default: 0 },
  previousMatches: [{ type: String }], // Track previous match IDs
  skip: { type: Boolean, default: false }, // Allow users to skip matching rounds
  preferredAgeRange: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 65 },
  },
  preferredGender: {
    type: String,
    enum: ["male", "female", "any"],
    default: "any",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MatchingUser =
  mongoose.models.MatchingUser ||
  mongoose.model("MatchingUser", MatchingUserSchema);

// Enhanced Match Result Schema
const MatchResultSchema = new mongoose.Schema({
  user1Id: { type: String, required: true },
  user2Id: { type: String, required: true },
  compatibilityScore: { type: Number, required: true },
  matchingFactors: [
    {
      factor: { type: String },
      score: { type: Number },
    },
  ],
  matchingRound: { type: Number, default: 1 }, // Track which round this match was created in
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "expired"],
    default: "pending",
  },
  notificationSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }, // 7 days
});

MatchResultSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
MatchResultSchema.index({ status: 1, createdAt: -1 });
MatchResultSchema.index({ expiresAt: 1 });

const MatchResult =
  mongoose.models.MatchResult ||
  mongoose.model("MatchResult", MatchResultSchema);

interface MatchingConfig {
  maxMatchesPerRun: number;
  minCompatibilityScore: number;
  cooldownHours: number;
  enableNotifications: boolean;
  countriesWithoutRegions: string[];
}

interface UserData {
  telegramId: string;
  name: string;
  age?: number;
  gender?: string;
  country: string;
  region?: string;
  interests: string[];
  hobbies: string[];
  personalityTraits: string[];
  placesToVisit: string[];
  previousMatches: string[];
  skip: boolean;
  preferredAgeRange: { min: number; max: number };
  preferredGender: string;
  isActive: boolean;
}

interface CompatibilityResult {
  score: number;
  factors: Array<{ factor: string; score: number }>;
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
      minCompatibilityScore: 0.3,
      cooldownHours: 24,
      enableNotifications: true,
      countriesWithoutRegions: ["Singapore", "Monaco", "Luxembourg"], // Small countries without regions
    };
  }

  /**
   * Normalize ID by removing leading apostrophe if present
   */
  private normalizeId(id: string): string {
    return id ? id.toString().replace(/^'/, "") : id;
  }

  /**
   * Enhanced compatibility scoring based on the SheetsScheduler algorithm
   */
  private calculateCompatibilityScore(
    user1: UserData,
    user2: UserData
  ): CompatibilityResult {
    const factors: Array<{ factor: string; score: number }> = [];
    let totalScore = 0;

    // Region compatibility (high weight: 4 points for same region)
    let regionScore = 0;
    if (user1.region && user2.region && user1.region === user2.region) {
      regionScore = 4;
    } else if (user1.country === user2.country) {
      regionScore = 2; // Same country but different region
    } else {
      regionScore = 0.5; // Different countries
    }
    factors.push({ factor: "region_compatibility", score: regionScore });
    totalScore += regionScore;

    // Common interests (1 point per common interest)
    const interests1 = Array.isArray(user1.interests) ? user1.interests : [];
    const interests2 = Array.isArray(user2.interests) ? user2.interests : [];
    const commonInterests = interests1.filter((interest) =>
      interests2.includes(interest)
    );
    const interestScore = commonInterests.length;
    factors.push({ factor: "common_interests", score: interestScore });
    totalScore += interestScore;

    // Common hobbies (0.5 points per common hobby)
    const hobbies1 = Array.isArray(user1.hobbies) ? user1.hobbies : [];
    const hobbies2 = Array.isArray(user2.hobbies) ? user2.hobbies : [];
    const commonHobbies = hobbies1.filter((hobby) => hobbies2.includes(hobby));
    const hobbyScore = commonHobbies.length * 0.5;
    factors.push({ factor: "common_hobbies", score: hobbyScore });
    totalScore += hobbyScore;

    // Travel destinations compatibility (0.5 points per common destination)
    const destinations1 = Array.isArray(user1.placesToVisit)
      ? user1.placesToVisit
      : [];
    const destinations2 = Array.isArray(user2.placesToVisit)
      ? user2.placesToVisit
      : [];
    const commonDestinations = destinations1.filter((place) =>
      destinations2.includes(place)
    );
    const destinationScore = commonDestinations.length * 0.5;
    factors.push({ factor: "travel_destinations", score: destinationScore });
    totalScore += destinationScore;

    // Age compatibility (bonus for similar ages)
    if (user1.age && user2.age) {
      const ageDiff = Math.abs(user1.age - user2.age);
      const ageScore = Math.max(0, 2 - ageDiff / 5); // 2 points max, decreasing with age difference
      factors.push({ factor: "age_compatibility", score: ageScore });
      totalScore += ageScore;
    }

    return {
      score: Math.round(totalScore * 100) / 100,
      factors: factors.map((f) => ({
        ...f,
        score: Math.round(f.score * 100) / 100,
      })),
    };
  }

  /**
   * Check if users meet basic compatibility preferences
   */
  private areUsersCompatible(user1: UserData, user2: UserData): boolean {
    // Age preference check
    if (user1.age && user2.age) {
      if (
        user1.age < user2.preferredAgeRange.min ||
        user1.age > user2.preferredAgeRange.max
      ) {
        return false;
      }
      if (
        user2.age < user1.preferredAgeRange.min ||
        user2.age > user1.preferredAgeRange.max
      ) {
        return false;
      }
    }

    // Gender preference check
    if (
      user1.preferredGender !== "any" &&
      user1.preferredGender !== user2.gender
    ) {
      return false;
    }
    if (
      user2.preferredGender !== "any" &&
      user2.preferredGender !== user1.gender
    ) {
      return false;
    }

    return true;
  }

  /**
   * Find matches within a group using optimal pairing algorithm
   */
  private findMatchesInGroup(groupUsers: UserData[]): Map<string, string> {
    const matches = new Map<string, string>();

    // Filter out users who want to skip
    const activeUsers = groupUsers.filter((user) => !user.skip);

    if (activeUsers.length < 2) {
      return matches;
    }

    // Create compatibility matrix
    const compatibilityScores = new Map<string, number>();

    // Calculate compatibility scores for all possible pairs
    for (let i = 0; i < activeUsers.length; i++) {
      for (let j = i + 1; j < activeUsers.length; j++) {
        const user1 = activeUsers[i];
        const user2 = activeUsers[j];

        // Check if users were previously matched
        const previouslyMatched =
          user1.previousMatches.some(
            (id) => this.normalizeId(id) === this.normalizeId(user2.telegramId)
          ) ||
          user2.previousMatches.some(
            (id) => this.normalizeId(id) === this.normalizeId(user1.telegramId)
          );

        if (previouslyMatched) {
          continue;
        }

        // Check basic compatibility
        if (!this.areUsersCompatible(user1, user2)) {
          continue;
        }

        const compatibility = this.calculateCompatibilityScore(user1, user2);
        const pairKey = `${user1.telegramId}-${user2.telegramId}`;
        compatibilityScores.set(pairKey, compatibility.score);
      }
    }

    // Sort pairs by score in descending order
    const sortedPairs = Array.from(compatibilityScores.entries()).sort(
      ([, score1], [, score2]) => score2 - score1
    );

    const matchedUsers = new Set<string>();

    // Match users starting from highest compatibility scores
    for (const [pairKey, score] of sortedPairs) {
      if (score < this.config.minCompatibilityScore) {
        break; // Stop if score is too low
      }

      const [user1Id, user2Id] = pairKey.split("-");

      // Skip if either user is already matched
      if (matchedUsers.has(user1Id) || matchedUsers.has(user2Id)) {
        continue;
      }

      // Record the match
      matches.set(user1Id, user2Id);
      matches.set(user2Id, user1Id);
      matchedUsers.add(user1Id);
      matchedUsers.add(user2Id);
    }

    return matches;
  }

  /**
   * Group users by country
   */
  private groupUsersByCountry(users: UserData[]): Record<string, UserData[]> {
    return users.reduce((groups, user) => {
      const country = user.country;
      if (!groups[country]) {
        groups[country] = [];
      }
      groups[country].push(user);
      return groups;
    }, {} as Record<string, UserData[]>);
  }

  /**
   * Group users by region within a country
   */
  private groupUsersByRegion(users: UserData[]): Record<string, UserData[]> {
    return users.reduce((groups, user) => {
      const region = user.region || "no_region";
      if (!groups[region]) {
        groups[region] = [];
      }
      groups[region].push(user);
      return groups;
    }, {} as Record<string, UserData[]>);
  }

  /**
   * Match users within regions of a country
   */
  private matchUsersWithinRegions(
    countryUsers: UserData[]
  ): Map<string, string> {
    const usersByRegion = this.groupUsersByRegion(countryUsers);
    const allMatches = new Map<string, string>();

    // Process each region
    for (const region in usersByRegion) {
      const regionMatches = this.findMatchesInGroup(usersByRegion[region]);

      // Merge region matches into all matches
      for (const [userId, matchId] of Array.from(regionMatches.entries())) {
        allMatches.set(userId, matchId);
      }
    }

    return allMatches;
  }

  /**
   * Get eligible users for matching
   */
  private async getEligibleUsers(): Promise<UserData[]> {
    await connectDB();

    const cooldownTime = new Date(
      Date.now() - this.config.cooldownHours * 60 * 60 * 1000
    );

    const users = await MatchingUser.find({
      isActive: true,
      $or: [{ lastMatchTime: { $lt: cooldownTime } }, { lastMatchTime: null }],
    }).lean();

    return users.map((user) => ({
      telegramId: user.telegramId,
      name: user.name,
      age: user.age,
      gender: user.gender,
      country: user.country,
      region: user.region,
      interests: user.interests || [],
      hobbies: user.hobbies || [],
      personalityTraits: user.personalityTraits || [],
      placesToVisit: user.placesToVisit || [],
      previousMatches: user.previousMatches || [],
      skip: user.skip || false,
      preferredAgeRange: user.preferredAgeRange || { min: 18, max: 65 },
      preferredGender: user.preferredGender || "any",
      isActive: user.isActive,
    }));
  }

  /**
   * Main matching algorithm using sophisticated pairing logic
   */
  async runMatching(): Promise<{
    success: boolean;
    matchesCreated: number;
    notificationsSent: number;
    errors: string[];
  }> {
    if (this.isRunning) {
      console.log("⏳ Matching service is already running");
      return {
        success: false,
        matchesCreated: 0,
        notificationsSent: 0,
        errors: ["Service already running"],
      };
    }

    this.isRunning = true;
    console.log("🚀 Starting sophisticated matching service...");

    const results = {
      success: true,
      matchesCreated: 0,
      notificationsSent: 0,
      errors: [] as string[],
    };

    try {
      await connectDB();

      // Get eligible users
      const users = await this.getEligibleUsers();
      console.log(`👥 Found ${users.length} eligible users for matching`);

      if (users.length < 2) {
        console.log("ℹ️ Not enough users for matching");
        return results;
      }

      // Group users by country
      const usersByCountry = this.groupUsersByCountry(users);

      // Process each country
      for (const country in usersByCountry) {
        console.log(`\n=== Processing ${country} ===`);
        let countryMatches: Map<string, string>;

        if (!this.config.countriesWithoutRegions.includes(country)) {
          // Use region-based matching for larger countries
          countryMatches = this.matchUsersWithinRegions(
            usersByCountry[country]
          );
        } else {
          // Use simple group matching for smaller countries
          countryMatches = this.findMatchesInGroup(usersByCountry[country]);
        }

        // Create match records and send notifications
        for (const [user1Id, user2Id] of Array.from(countryMatches.entries())) {
          // Skip if this pair has already been processed (since we store bidirectional matches)
          if (
            results.matchesCreated > 0 &&
            countryMatches.get(user2Id) === user1Id
          ) {
            continue;
          }

          try {
            const user1 = users.find((u) => u.telegramId === user1Id);
            const user2 = users.find((u) => u.telegramId === user2Id);

            if (!user1 || !user2) continue;

            // Calculate final compatibility score
            const compatibility = this.calculateCompatibilityScore(
              user1,
              user2
            );

            // Create match record
            const matchResult = new MatchResult({
              user1Id: user1Id,
              user2Id: user2Id,
              compatibilityScore: compatibility.score,
              matchingFactors: compatibility.factors,
            });

            await matchResult.save();
            results.matchesCreated++;

            // Update user records with new match
            await MatchingUser.updateMany(
              { telegramId: { $in: [user1Id, user2Id] } },
              {
                lastMatchTime: new Date(),
                $inc: { totalMatches: 1 },
                $addToSet: { previousMatches: { $each: [user2Id, user1Id] } },
              }
            );

            // Send notifications if enabled
            if (this.config.enableNotifications) {
              try {
                // Notify user1 about user2
                await this.notificationService.notifyNewMatch(user1Id, {
                  id: matchResult._id.toString(),
                  name: user2.name,
                  country: user2.country,
                  interests: user2.interests,
                  photo: undefined,
                });

                // Notify user2 about user1
                await this.notificationService.notifyNewMatch(user2Id, {
                  id: matchResult._id.toString(),
                  name: user1.name,
                  country: user1.country,
                  interests: user1.interests,
                  photo: undefined,
                });

                // Mark notifications as sent
                await MatchResult.updateOne(
                  { _id: matchResult._id },
                  { notificationSent: true }
                );

                results.notificationsSent += 2;
                console.log(
                  `🔔 Notifications sent for match: ${user1.name} ↔ ${user2.name} (Score: ${compatibility.score})`
                );
              } catch (notificationError) {
                console.error(
                  "Error sending notifications:",
                  notificationError
                );
                results.errors.push(
                  `Notification error for match ${matchResult._id}: ${notificationError}`
                );
              }
            }

            console.log(
              `✅ Created match: ${user1.name} ↔ ${user2.name} (Score: ${compatibility.score})`
            );
          } catch (matchError) {
            console.error("Error creating match:", matchError);
            results.errors.push(`Match creation error: ${matchError}`);
          }
        }

        // Report unmatched users
        const unmatchedUsers = usersByCountry[country].filter(
          (user) => !countryMatches.has(user.telegramId) && !user.skip
        );

        if (unmatchedUsers.length > 0) {
          console.log(
            `\nUnmatched users in ${country}: ${unmatchedUsers.length}`
          );
          unmatchedUsers.forEach((user) => {
            console.log(
              `  - ${user.name} (${user.telegramId}) in ${
                user.region || "no region"
              }`
            );
          });
        }
      }

      console.log(
        `🎉 Sophisticated matching completed: ${results.matchesCreated} matches created, ${results.notificationsSent} notifications sent`
      );
    } catch (error) {
      console.error("Error in matching service:", error);
      results.success = false;
      results.errors.push(`General error: ${error}`);
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  // Create mock users for testing
  async createMockUsers(count: number = 10) {
    await connectDB();

    const mockUsers = [];
    const countries = ["Vietnam", "Thailand", "Indonesia", "Sri Lanka"];
    const regions: Record<string, string[]> = {
      Vietnam: ["Da Nang", "Nha Trang", "Ho Chi Minh City"],
      Thailand: ["Bangkok", "Phuket", "Chiang Mai"],
      Indonesia: ["Bali", "Jakarta", "Yogyakarta"],
      "Sri Lanka": ["Colombo", "Kandy", "Galle"],
    };
    const interests = [
      "Photography",
      "Hiking",
      "Food",
      "Art",
      "Music",
      "Sports",
      "Reading",
      "Travel",
      "Dancing",
      "Cooking",
    ];
    const hobbies = [
      "Swimming",
      "Running",
      "Yoga",
      "Cycling",
      "Painting",
      "Gaming",
      "Writing",
      "Meditation",
    ];
    const destinations = [
      "Bali",
      "Thailand",
      "Vietnam",
      "Japan",
      "Europe",
      "Australia",
    ];

    for (let i = 1; i <= count; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const region =
        regions[country][Math.floor(Math.random() * regions[country].length)];

      mockUsers.push({
        telegramId: `mock_user_${i}`,
        username: `traveler${i}`,
        name: `User ${i}`,
        age: 20 + Math.floor(Math.random() * 30),
        gender: ["male", "female"][Math.floor(Math.random() * 2)],
        country,
        region,
        interests: interests.slice(0, 3 + Math.floor(Math.random() * 4)),
        hobbies: hobbies.slice(0, 2 + Math.floor(Math.random() * 3)),
        placesToVisit: destinations.slice(0, 2 + Math.floor(Math.random() * 3)),
        preferredAgeRange: {
          min: 18 + Math.floor(Math.random() * 10),
          max: 40 + Math.floor(Math.random() * 20),
        },
        preferredGender: ["male", "female", "any"][
          Math.floor(Math.random() * 3)
        ],
        previousMatches: [],
        skip: false,
      });
    }

    try {
      await MatchingUser.insertMany(mockUsers);
      console.log(`✅ Created ${count} mock users for testing`);
      return { success: true, count };
    } catch (error) {
      console.error("Error creating mock users:", error);
      return { success: false, error };
    }
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
        matchesToday,
      ] = await Promise.all([
        MatchingUser.countDocuments({}),
        MatchingUser.countDocuments({ isActive: true }),
        MatchResult.countDocuments({}),
        MatchResult.countDocuments({ status: "pending" }),
        MatchResult.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
      ]);

      const avgCompatibilityScore = await MatchResult.aggregate([
        { $group: { _id: null, avgScore: { $avg: "$compatibilityScore" } } },
      ]);

      return {
        totalUsers,
        activeUsers,
        totalMatches,
        pendingMatches,
        matchesToday,
        avgCompatibilityScore: avgCompatibilityScore[0]?.avgScore || 0,
        isRunning: this.isRunning,
        config: this.config,
      };
    } catch (error) {
      console.error("Error getting matching stats:", error);
      return null;
    }
  }

  // Clean expired matches
  async cleanupExpiredMatches() {
    try {
      await connectDB();

      const result = await MatchResult.updateMany(
        {
          status: "pending",
          expiresAt: { $lt: new Date() },
        },
        { status: "expired" }
      );

      console.log(`🧹 Marked ${result.modifiedCount} matches as expired`);
      return result.modifiedCount;
    } catch (error) {
      console.error("Error cleaning expired matches:", error);
      return 0;
    }
  }

  // Update matching configuration
  updateConfig(newConfig: Partial<MatchingConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log("⚙️ Matching configuration updated:", this.config);
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
      lastRun: null, // You can implement this if needed
    };
  }
}

export default MatchingService;
