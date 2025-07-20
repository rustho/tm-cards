import { Profile, IProfile } from '@/models/schemas/profile.schema';
import { DatabaseService } from './database.service';
import { Types } from 'mongoose';
import type { ProfileData } from '@/models/types';
import { calculateAge } from '../dateUtils';

export class ProfileService extends DatabaseService<IProfile> {
  constructor() {
    super(Profile);
  }

  async findByUserId(userId: string): Promise<IProfile | null> {
    return await this.findOne({ userId: new Types.ObjectId(userId) });
  }

  async createProfile(userId: string, profileData: Partial<ProfileData>): Promise<IProfile> {
    return await this.create({
      userId: new Types.ObjectId(userId),
      name: profileData.name || '',
      dateOfBirth: profileData.dateOfBirth || '',
      occupation: profileData.occupation || '',
      about: profileData.about || '',
      country: profileData.country || '',
      region: profileData.region || '',
      interests: profileData.interests || [],
      hobbies: profileData.hobbies || [],
      personalityTraits: profileData.personalityTraits || [],
      placesToVisit: profileData.placesToVisit || '',
      instagram: profileData.instagram || '',
      announcement: profileData.announcement || '',
      photo: profileData.photo || '',
      profile: profileData.profile || ''
    });
  }

  async updateProfile(userId: string, profileData: Partial<ProfileData>): Promise<IProfile | null> {
    return await this.updateOne(
      { userId: new Types.ObjectId(userId) },
      profileData
    );
  }

  async getMatchingProfiles(filters: {
    excludeUserId: string;
    country?: string;
    interests?: string[];
    limit?: number;
  }): Promise<IProfile[]> {
    const query: any = {
      userId: { $ne: new Types.ObjectId(filters.excludeUserId) },
      isActive: true,
      isComplete: true
    };

    // Location filter
    if (filters.country) {
      query.country = filters.country;
    }

    // Interest filter (using array intersection)
    if (filters.interests && filters.interests.length > 0) {
      query.interests = { $in: filters.interests };
    }

    return await this.find(
      query,
      { 
        limit: filters.limit || 50,
        sort: { lastProfileUpdate: -1 }
      }
    );
  }

  async calculateCompatibility(profile1: IProfile, profile2: IProfile): Promise<{
    score: number;
    reasons: string[];
  }> {
    let score = 0;
    const reasons: string[] = [];

    // Location compatibility (30 points)
    if (profile1.country === profile2.country) {
      score += 20;
      reasons.push('same_country');
      
      if (profile1.region === profile2.region) {
        score += 10;
        reasons.push('same_region');
      }
    }

    // Age compatibility (20 points)
    const age1 = calculateAge(profile1.dateOfBirth);
    const age2 = calculateAge(profile2.dateOfBirth);
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 5) {
      score += 20;
      reasons.push('similar_age');
    } else if (ageDiff <= 10) {
      score += 10;
      reasons.push('compatible_age');
    }

    // Interest compatibility (30 points)
    const commonInterests = profile1.interests.filter(interest =>
      profile2.interests.includes(interest)
    );
    if (commonInterests.length > 0) {
      score += Math.min(commonInterests.length * 5, 30);
      reasons.push('common_interests');
    }

    // Hobby compatibility (20 points)
    const commonHobbies = profile1.hobbies.filter(hobby =>
      profile2.hobbies.includes(hobby)
    );
    if (commonHobbies.length > 0) {
      score += Math.min(commonHobbies.length * 10, 20);
      reasons.push('similar_hobbies');
    }

    return { score: Math.min(score, 100), reasons };
  }

  async getProfilesByCountryAndRegion(country: string, region?: string): Promise<IProfile[]> {
    const query: any = {
      isActive: true,
      isComplete: true,
      country
    };

    if (region) {
      query.region = region;
    }

    return await this.find(query, { sort: { lastProfileUpdate: -1 } });
  }

  async searchProfilesByInterests(interests: string[], limit: number = 20): Promise<IProfile[]> {
    return await this.find(
      {
        isActive: true,
        isComplete: true,
        interests: { $in: interests }
      },
      { 
        limit,
        sort: { lastProfileUpdate: -1 }
      }
    );
  }

  async getIncompleteProfiles(): Promise<IProfile[]> {
    return await this.find({
      isActive: true,
      isComplete: false
    });
  }

  async updateProfileCompletionStatus(userId: string): Promise<IProfile | null> {
    // This will trigger the pre-save hook to recalculate completion percentage
    const profile = await this.findByUserId(userId);
    if (profile) {
      return await profile.save();
    }
    return null;
  }
}

export const profileService = new ProfileService(); 