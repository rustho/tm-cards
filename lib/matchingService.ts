import type { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { notifyUser } from "./bot";
import { HOBBIES, INTERESTS, LOCATIONS } from "@/models/types";

/**
 * Matching engine. Pairs active users within the same country/region by a
 * compatibility score and records the result in MatchResult.
 *
 * Triggered by POST /api/matching?action=run (admin) or GET /api/cron/matching
 * (Vercel Cron). There is no in-process scheduler.
 */

export interface MatchingConfig {
  /** Upper bound on pairs created in one run. */
  maxMatchesPerRun: number;
  /** Pairs below this score are not created. */
  minCompatibilityScore: number;
  /** A user is eligible again this many hours after their last match. */
  cooldownHours: number;
  /** Send a Telegram message to both users when a pair is created. */
  enableNotifications: boolean;
  /** Countries matched as a single pool instead of per region. */
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
}

export interface CompatibilityResult {
  score: number;
  factors: Array<{ factor: string; score: number }>;
}

interface ScoredPair {
  user1Id: string;
  user2Id: string;
  score: number;
}

export interface RunResult {
  success: boolean;
  matchesCreated: number;
  notificationsSent: number;
  eligibleUsers: number;
  unmatched: number;
  errors: string[];
  startedAt: string;
  finishedAt: string;
}

const MATCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

class MatchingService {
  private static instance: MatchingService;
  private config: MatchingConfig;
  private isRunning = false;
  private lastRun: RunResult | null = null;

  static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  constructor() {
    this.config = {
      maxMatchesPerRun: 50,
      minCompatibilityScore: 0.3,
      cooldownHours: 24,
      enableNotifications: process.env.MATCHING_NOTIFICATIONS === "true",
      countriesWithoutRegions: ["Singapore", "Monaco", "Luxembourg"],
    };
  }

  /** Normalize ids coming from spreadsheet-era data ("'123" → "123"). */
  private normalizeId(id: string): string {
    return id ? id.toString().replace(/^'/, "") : id;
  }

  calculateCompatibilityScore(user1: UserData, user2: UserData): CompatibilityResult {
    const factors: Array<{ factor: string; score: number }> = [];
    let total = 0;

    // Region: 4 same region, 2 same country, 0.5 otherwise
    let regionScore = 0.5;
    if (user1.region && user2.region && user1.region === user2.region) {
      regionScore = 4;
    } else if (user1.country === user2.country) {
      regionScore = 2;
    }
    factors.push({ factor: "region_compatibility", score: regionScore });
    total += regionScore;

    const common = (a: string[], b: string[]) => a.filter((x) => b.includes(x)).length;

    const interestScore = common(user1.interests, user2.interests);
    factors.push({ factor: "common_interests", score: interestScore });
    total += interestScore;

    const hobbyScore = common(user1.hobbies, user2.hobbies) * 0.5;
    factors.push({ factor: "common_hobbies", score: hobbyScore });
    total += hobbyScore;

    const destinationScore = common(user1.placesToVisit, user2.placesToVisit) * 0.5;
    factors.push({ factor: "travel_destinations", score: destinationScore });
    total += destinationScore;

    if (user1.age && user2.age) {
      const ageScore = Math.max(0, 2 - Math.abs(user1.age - user2.age) / 5);
      factors.push({ factor: "age_compatibility", score: ageScore });
      total += ageScore;
    }

    const round = (n: number) => Math.round(n * 100) / 100;
    return {
      score: round(total),
      factors: factors.map((f) => ({ ...f, score: round(f.score) })),
    };
  }

  /** Mutual age-range and gender preferences. */
  private areUsersCompatible(user1: UserData, user2: UserData): boolean {
    if (user1.age && user2.age) {
      if (user1.age < user2.preferredAgeRange.min || user1.age > user2.preferredAgeRange.max) return false;
      if (user2.age < user1.preferredAgeRange.min || user2.age > user1.preferredAgeRange.max) return false;
    }
    if (user1.preferredGender !== "any" && user1.preferredGender !== user2.gender) return false;
    if (user2.preferredGender !== "any" && user2.preferredGender !== user1.gender) return false;
    return true;
  }

  private wereMatchedBefore(user1: UserData, user2: UserData): boolean {
    const id1 = this.normalizeId(user1.telegramId);
    const id2 = this.normalizeId(user2.telegramId);
    return (
      user1.previousMatches.some((id) => this.normalizeId(id) === id2) ||
      user2.previousMatches.some((id) => this.normalizeId(id) === id1)
    );
  }

  /**
   * Greedy pairing inside one pool: score every valid pair, sort desc, take
   * pairs whose users are still free. Returns each pair exactly once.
   */
  private findPairsInGroup(group: UserData[]): ScoredPair[] {
    const active = group.filter((u) => !u.skip);
    if (active.length < 2) return [];

    const candidates: ScoredPair[] = [];
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i];
        const b = active[j];
        if (this.wereMatchedBefore(a, b)) continue;
        if (!this.areUsersCompatible(a, b)) continue;
        const { score } = this.calculateCompatibilityScore(a, b);
        if (score < this.config.minCompatibilityScore) continue;
        candidates.push({ user1Id: a.telegramId, user2Id: b.telegramId, score });
      }
    }

    candidates.sort((x, y) => y.score - x.score);

    const taken = new Set<string>();
    const pairs: ScoredPair[] = [];
    for (const pair of candidates) {
      if (taken.has(pair.user1Id) || taken.has(pair.user2Id)) continue;
      taken.add(pair.user1Id);
      taken.add(pair.user2Id);
      pairs.push(pair);
    }
    return pairs;
  }

  private groupBy(users: UserData[], key: (u: UserData) => string): Record<string, UserData[]> {
    return users.reduce<Record<string, UserData[]>>((acc, user) => {
      const k = key(user);
      (acc[k] ||= []).push(user);
      return acc;
    }, {});
  }

  /**
   * Users who can be matched right now: active, past cooldown, and not
   * paused through their matching-schedule setting.
   */
  private async getEligibleUsers(): Promise<UserData[]> {
    const now = new Date();

    // Auto-resume schedules whose pause has expired.
    await prisma.userSettings.updateMany({
      where: { matchingOption: { not: "active" }, matchingResumeDate: { lte: now } },
      data: { matchingOption: "active", matchingResumeDate: null, matchingCustomDate: null },
    });

    const cooldown = new Date(now.getTime() - this.config.cooldownHours * 60 * 60 * 1000);
    const rows = await prisma.matchingUser.findMany({
      where: {
        isActive: true,
        country: { not: null },
        OR: [{ lastMatchTime: { lt: cooldown } }, { lastMatchTime: null }],
      },
      include: { settings: true },
    });

    return rows
      .filter((row) => !row.settings || row.settings.matchingOption === "active")
      .map((row) => ({
        telegramId: row.telegramId,
        name: row.name || "",
        age: row.age ?? undefined,
        gender: row.gender ?? undefined,
        country: row.country || "",
        region: row.region ?? undefined,
        interests: row.interests,
        hobbies: row.hobbies,
        personalityTraits: row.personalityTraits,
        placesToVisit: row.placesToVisit,
        previousMatches: row.previousMatches,
        skip: row.skip,
        preferredAgeRange: { min: row.preferredAgeMin, max: row.preferredAgeMax },
        preferredGender: row.preferredGender,
      }));
  }

  async runMatching(): Promise<RunResult> {
    const startedAt = new Date().toISOString();
    const result: RunResult = {
      success: true,
      matchesCreated: 0,
      notificationsSent: 0,
      eligibleUsers: 0,
      unmatched: 0,
      errors: [],
      startedAt,
      finishedAt: startedAt,
    };

    if (this.isRunning) {
      return { ...result, success: false, errors: ["Matching is already running"] };
    }
    this.isRunning = true;
    console.log("🚀 Matching run started");

    try {
      const users = await this.getEligibleUsers();
      result.eligibleUsers = users.length;
      console.log(`👥 ${users.length} eligible users`);

      if (users.length < 2) {
        result.unmatched = users.length;
        return result;
      }

      const byId = new Map(users.map((u) => [u.telegramId, u]));
      const allPairs: ScoredPair[] = [];

      const byCountry = this.groupBy(users, (u) => u.country || "Unknown");
      for (const [country, countryUsers] of Object.entries(byCountry)) {
        if (this.config.countriesWithoutRegions.includes(country)) {
          allPairs.push(...this.findPairsInGroup(countryUsers));
        } else {
          const byRegion = this.groupBy(countryUsers, (u) => u.region || "no_region");
          for (const regionUsers of Object.values(byRegion)) {
            allPairs.push(...this.findPairsInGroup(regionUsers));
          }
        }
      }

      allPairs.sort((a, b) => b.score - a.score);
      const pairs = allPairs.slice(0, this.config.maxMatchesPerRun);

      for (const pair of pairs) {
        const user1 = byId.get(pair.user1Id);
        const user2 = byId.get(pair.user2Id);
        if (!user1 || !user2) continue;

        // Store each pair once with a stable ordering (unique index on the pair).
        const [firstId, secondId] = [pair.user1Id, pair.user2Id].sort();
        const compatibility = this.calculateCompatibilityScore(user1, user2);

        try {
          await prisma.$transaction([
            prisma.matchResult.create({
              data: {
                user1Id: firstId,
                user2Id: secondId,
                compatibilityScore: compatibility.score,
                matchingFactors: compatibility.factors as unknown as Prisma.InputJsonValue,
                expiresAt: new Date(Date.now() + MATCH_TTL_MS),
              },
            }),
            prisma.matchingUser.update({
              where: { telegramId: pair.user1Id },
              data: { lastMatchTime: new Date(), totalMatches: { increment: 1 }, previousMatches: { push: pair.user2Id } },
            }),
            prisma.matchingUser.update({
              where: { telegramId: pair.user2Id },
              data: { lastMatchTime: new Date(), totalMatches: { increment: 1 }, previousMatches: { push: pair.user1Id } },
            }),
          ]);
          result.matchesCreated++;
          console.log(`✅ Match: ${user1.name} ↔ ${user2.name} (${compatibility.score})`);

          if (this.config.enableNotifications) {
            const sent = await Promise.all([
              notifyUser(user1.telegramId, this.matchMessage(user2)),
              notifyUser(user2.telegramId, this.matchMessage(user1)),
            ]);
            result.notificationsSent += sent.filter(Boolean).length;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("❌ Failed to create match:", message);
          result.errors.push(`Pair ${firstId}-${secondId}: ${message}`);
        }
      }

      const matched = new Set(pairs.flatMap((p) => [p.user1Id, p.user2Id]));
      result.unmatched = users.filter((u) => !u.skip && !matched.has(u.telegramId)).length;
      console.log(`🎉 Matching finished: ${result.matchesCreated} matches, ${result.unmatched} unmatched`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Matching run failed:", message);
      result.success = false;
      result.errors.push(message);
    } finally {
      this.isRunning = false;
      result.finishedAt = new Date().toISOString();
      this.lastRun = result;
    }

    return result;
  }

  private matchMessage(other: UserData): string {
    const where = [other.region, other.country].filter(Boolean).join(", ");
    const interests = other.interests.slice(0, 3).join(", ");
    return (
      `🎯 <b>Новое совпадение!</b>\n\n` +
      `<b>${other.name || "Путешественник"}</b>${where ? ` · ${where}` : ""}\n` +
      (interests ? `Интересы: ${interests}\n` : "") +
      `\nОткрой TravelMate, чтобы посмотреть профиль.`
    );
  }

  /** Inserts fake users that share the real option lists so they can be matched with real profiles. */
  async createMockUsers(count = 10) {
    const pick = <T,>(arr: readonly T[], n: number) =>
      [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    try {
      for (let i = 1; i <= count; i++) {
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const region = location.regions[Math.floor(Math.random() * location.regions.length)];
        await prisma.matchingUser.create({
          data: {
            telegramId: `mock_${Date.now().toString(36)}_${i}`,
            username: `traveler${i}`,
            name: `Mock User ${i}`,
            age: 20 + Math.floor(Math.random() * 30),
            gender: ["male", "female"][Math.floor(Math.random() * 2)],
            country: location.country,
            region,
            interests: pick(INTERESTS, 3 + Math.floor(Math.random() * 2)),
            hobbies: pick(HOBBIES, 2 + Math.floor(Math.random() * 2)),
            placesToVisit: pick(LOCATIONS.map((l) => l.country), 2),
            previousMatches: [],
          },
        });
      }
      console.log(`✅ Created ${count} mock users`);
      return { success: true, count };
    } catch (error) {
      console.error("❌ Error creating mock users:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async getMatchingStats() {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalUsers, activeUsers, totalMatches, pendingMatches, matchesToday, avg] = await Promise.all([
      prisma.matchingUser.count(),
      prisma.matchingUser.count({ where: { isActive: true } }),
      prisma.matchResult.count(),
      prisma.matchResult.count({ where: { status: "pending" } }),
      prisma.matchResult.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.matchResult.aggregate({ _avg: { compatibilityScore: true } }),
    ]);
    return {
      totalUsers,
      activeUsers,
      totalMatches,
      pendingMatches,
      matchesToday,
      avgCompatibilityScore: avg._avg.compatibilityScore ?? 0,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      config: this.config,
    };
  }

  async cleanupExpiredMatches(): Promise<number> {
    const result = await prisma.matchResult.updateMany({
      where: { status: "pending", expiresAt: { lt: new Date() } },
      data: { status: "expired" },
    });
    if (result.count > 0) console.log(`🧹 Expired ${result.count} matches`);
    return result.count;
  }

  updateConfig(newConfig: Partial<MatchingConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log("⚙️ Matching configuration updated:", this.config);
  }

  getConfig(): MatchingConfig {
    return { ...this.config };
  }

  getStatus() {
    return { isRunning: this.isRunning, lastRun: this.lastRun, config: this.config };
  }
}

export default MatchingService;
