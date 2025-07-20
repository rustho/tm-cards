import { Match, IMatch } from '@/models/schemas/match.schema';
import { DatabaseService } from './database.service';
import { profileService } from './profile.service';
import { Types } from 'mongoose';

export class MatchService extends DatabaseService<IMatch> {
  constructor() {
    super(Match);
  }

  async createMatch(
    user1Id: string,
    user2Id: string,
    compatibilityScore: number,
    matchingReasons: string[]
  ): Promise<IMatch> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    return await this.create({
      user1Id: new Types.ObjectId(user1Id),
      user2Id: new Types.ObjectId(user2Id),
      compatibilityScore,
      matchingReasons,
      expiresAt
    });
  }

  async findMatchesByUserId(userId: string): Promise<IMatch[]> {
    return await this.find({
      $or: [
        { user1Id: new Types.ObjectId(userId) },
        { user2Id: new Types.ObjectId(userId) }
      ]
    }, { sort: { createdAt: -1 } });
  }

  async findPendingMatchesByUserId(userId: string): Promise<IMatch[]> {
    return await this.find({
      $or: [
        { user1Id: new Types.ObjectId(userId) },
        { user2Id: new Types.ObjectId(userId) }
      ],
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }, { sort: { createdAt: -1 } });
  }

  async updateMatchAction(
    matchId: string,
    userId: string,
    action: 'liked' | 'passed'
  ): Promise<IMatch | null> {
    const match = await this.findById(matchId);
    if (!match) return null;

    const isUser1 = match.user1Id.toString() === userId;
    const updateField = isUser1 ? 'user1Action' : 'user2Action';
    
    const updatedMatch = await this.updateById(matchId, {
      [updateField]: action,
      lastActionAt: new Date()
    });

    // Check if it's a mutual like
    if (updatedMatch && action === 'liked') {
      const otherAction = isUser1 ? updatedMatch.user2Action : updatedMatch.user1Action;
      if (otherAction === 'liked') {
        await this.updateById(matchId, { status: 'mutual_like' });
      }
    }

    return updatedMatch;
  }

  async findMutualMatches(userId: string): Promise<IMatch[]> {
    return await this.find({
      $or: [
        { user1Id: new Types.ObjectId(userId) },
        { user2Id: new Types.ObjectId(userId) }
      ],
      status: 'mutual_like'
    }, { sort: { createdAt: -1 } });
  }

  async generateMatchesForUser(userId: string, limit: number = 10): Promise<IMatch[]> {
    // Get user's profile
    const userProfile = await profileService.findByUserId(userId);
    if (!userProfile || !userProfile.isComplete) {
      throw new Error('User profile is incomplete');
    }

    // Find potential matches
    const potentialMatches = await profileService.getMatchingProfiles({
      excludeUserId: userId,
      country: userProfile.country,
      interests: userProfile.interests,
      limit: limit * 2
    });

    // Filter out users who already have matches
    const existingMatches = await this.findMatchesByUserId(userId);
    const existingUserIds = new Set(
      existingMatches.flatMap(match => [
        match.user1Id.toString(),
        match.user2Id.toString()
      ])
    );

    const filteredMatches = potentialMatches.filter(
      profile => !existingUserIds.has(profile.userId.toString())
    );

    // Create matches with compatibility scores
    const newMatches: IMatch[] = [];
    for (const matchProfile of filteredMatches.slice(0, limit)) {
      const compatibility = await profileService.calculateCompatibility(
        userProfile,
        matchProfile
      );

      if (compatibility.score >= 60) {
        const match = await this.createMatch(
          userId,
          matchProfile.userId.toString(),
          compatibility.score,
          compatibility.reasons
        );
        newMatches.push(match);
      }
    }

    return newMatches;
  }

  async expireOldMatches(): Promise<number> {
    const result = await this.model.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        status: 'expired'
      }
    );

    return result.modifiedCount;
  }
}

export const matchService = new MatchService(); 