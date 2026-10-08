import type { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { notifyUser } from "./bot";
import { userWithProfileInclude, type UserWithProfile } from "./profileDto";
import { INTERESTS, LOCATIONS, MEETING_FORMATS, VALUES } from "@/models/types";
import { TRIAL_DAYS } from "@/config/constants";
import { closeUnagreedMatches } from "./weekCycle";

/**
 * Matching engine. Once per weekly round it pairs complete, active profiles
 * within the same country/region by a compatibility score and stores the
 * result in `matches`. Triggered by POST /api/matching?action=run (admin) or
 * GET /api/cron/matching (Vercel Cron).
 */

export interface MatchingConfig {
  maxMatchesPerRun: number;
  minCompatibilityScore: number;
  cooldownHours: number;
  enableNotifications: boolean;
  countriesWithoutRegions: string[];
}

interface Candidate {
  userId: string;
  telegramId: string;
  name: string;
  age?: number;
  gender?: string;
  country: string;
  region: string;
  interests: string[];
  values: string[];
  meetingFormats: string[];
  placesToVisit: string[];
  previousPartners: Set<string>;
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredGender: string;
}

export interface CompatibilityResult {
  score: number;
  factors: Array<{ factor: string; score: number }>;
}

interface ScoredPair {
  a: Candidate;
  b: Candidate;
  score: number;
}

export interface RunResult {
  success: boolean;
  roundWeekStart: string | null;
  matchesCreated: number;
  notificationsSent: number;
  eligibleUsers: number;
  unmatched: number;
  errors: string[];
  startedAt: string;
  finishedAt: string;
}

const MATCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Monday 00:00 UTC of the week containing `date`. */
export function weekStartOf(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  return d;
}

function ageOf(dateOfBirth: Date | null): number | undefined {
  if (!dateOfBirth) return undefined;
  const now = new Date();
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const m = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dateOfBirth.getUTCDate())) age--;
  return age;
}

class MatchingService {
  private static instance: MatchingService;
  private config: MatchingConfig;
  private isRunning = false;
  private lastRun: RunResult | null = null;

  static getInstance(): MatchingService {
    if (!MatchingService.instance) MatchingService.instance = new MatchingService();
    return MatchingService.instance;
  }

  constructor() {
    this.config = {
      maxMatchesPerRun: 50,
      minCompatibilityScore: 0.3,
      cooldownHours: 24,
      enableNotifications: process.env.MATCHING_NOTIFICATIONS === "true",
      countriesWithoutRegions: ["Singapore", "Monaco", "Luxembourg", "Сингапур"],
    };
  }

  calculateCompatibilityScore(a: Candidate, b: Candidate): CompatibilityResult {
    const factors: Array<{ factor: string; score: number }> = [];
    let total = 0;
    const common = (x: string[], y: string[]) => x.filter((v) => y.includes(v)).length;

    let regionScore = 0.5;
    if (a.region && b.region && a.region === b.region) regionScore = 4;
    else if (a.country === b.country) regionScore = 2;
    factors.push({ factor: "region_compatibility", score: regionScore });
    total += regionScore;

    const interestScore = common(a.interests, b.interests);
    factors.push({ factor: "common_interests", score: interestScore });
    total += interestScore;

    const valueScore = common(a.values, b.values) * 0.25;
    factors.push({ factor: "common_values", score: valueScore });
    total += valueScore;

    const formatScore = common(a.meetingFormats, b.meetingFormats) * 0.5;
    factors.push({ factor: "common_meeting_formats", score: formatScore });
    total += formatScore;

    const destinationScore = common(a.placesToVisit, b.placesToVisit) * 0.5;
    factors.push({ factor: "travel_destinations", score: destinationScore });
    total += destinationScore;

    if (a.age && b.age) {
      const ageScore = Math.max(0, 2 - Math.abs(a.age - b.age) / 5);
      factors.push({ factor: "age_compatibility", score: ageScore });
      total += ageScore;
    }

    const round = (n: number) => Math.round(n * 100) / 100;
    return { score: round(total), factors: factors.map((f) => ({ ...f, score: round(f.score) })) };
  }

  private areCompatible(a: Candidate, b: Candidate): boolean {
    if (a.age && b.age) {
      if (a.age < b.preferredAgeMin || a.age > b.preferredAgeMax) return false;
      if (b.age < a.preferredAgeMin || b.age > a.preferredAgeMax) return false;
    }
    if (a.preferredGender !== "any" && a.preferredGender !== b.gender) return false;
    if (b.preferredGender !== "any" && b.preferredGender !== a.gender) return false;
    return !a.previousPartners.has(b.userId) && !b.previousPartners.has(a.userId);
  }

  /** Greedy pairing inside one pool; each pair returned once. */
  private findPairsInGroup(group: Candidate[]): ScoredPair[] {
    if (group.length < 2) return [];
    const candidates: ScoredPair[] = [];
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        if (!this.areCompatible(a, b)) continue;
        const { score } = this.calculateCompatibilityScore(a, b);
        if (score < this.config.minCompatibilityScore) continue;
        candidates.push({ a, b, score });
      }
    }
    candidates.sort((x, y) => y.score - x.score);
    const taken = new Set<string>();
    const pairs: ScoredPair[] = [];
    for (const pair of candidates) {
      if (taken.has(pair.a.userId) || taken.has(pair.b.userId)) continue;
      taken.add(pair.a.userId);
      taken.add(pair.b.userId);
      pairs.push(pair);
    }
    return pairs;
  }

  private groupBy(users: Candidate[], key: (u: Candidate) => string): Record<string, Candidate[]> {
    return users.reduce<Record<string, Candidate[]>>((acc, u) => {
      (acc[key(u)] ||= []).push(u);
      return acc;
    }, {});
  }

  private toCandidate(
    user: UserWithProfile & { settings: { preferredAgeMin: number; preferredAgeMax: number; preferredGender: string } | null },
    previousPartners: Set<string>
  ): Candidate {
    const p = user.profile!;
    const tags = (category: string) => p.tags.filter((t) => t.tag.category === category).map((t) => t.tag.label);
    return {
      userId: user.id,
      telegramId: user.telegramId,
      name: p.name ?? user.firstName ?? "",
      age: ageOf(p.dateOfBirth),
      gender: p.gender ?? undefined,
      country: p.location?.country ?? "",
      region: p.location?.region ?? "",
      interests: tags("interest"),
      values: tags("value"),
      meetingFormats: tags("format"),
      placesToVisit: p.placesToVisit,
      previousPartners,
      preferredAgeMin: user.settings?.preferredAgeMin ?? 18,
      preferredAgeMax: user.settings?.preferredAgeMax ?? 65,
      preferredGender: user.settings?.preferredGender ?? "any",
    };
  }

  /**
   * Active users with a complete profile and a location, past cooldown, not paused or skipping,
   * and with access: an active subscription or still inside the trial (same rule as getAccess).
   */
  private async getCandidates(): Promise<Candidate[]> {
    const now = new Date();

    await prisma.userSettings.updateMany({
      where: { matchingOption: { not: "active" }, matchingResumeDate: { lte: now } },
      data: { matchingOption: "active", matchingResumeDate: null, matchingCustomDate: null },
    });

    const cooldown = new Date(now.getTime() - this.config.cooldownHours * 60 * 60 * 1000);
    const users = await prisma.user.findMany({
      where: {
        status: "active",
        profile: { isComplete: true, locationId: { not: null } },
        OR: [{ lastMatchedAt: { lt: cooldown } }, { lastMatchedAt: null }],
        AND: [
          { OR: [{ settings: null }, { settings: { matchingOption: "active" } }] },
          { OR: [{ settings: null }, { settings: { skipNextRound: false } }] },
          {
            OR: [
              { createdAt: { gt: new Date(now.getTime() - TRIAL_DAYS * 24 * 60 * 60 * 1000) } },
              { subscriptions: { some: { status: "active", endsAt: { gt: now } } } },
            ],
          },
        ],
      },
      include: { ...userWithProfileInclude, settings: true },
    });
    if (users.length === 0) return [];

    const ids = users.map((u) => u.id);
    const history = await prisma.match.findMany({
      where: { OR: [{ user1Id: { in: ids } }, { user2Id: { in: ids } }] },
      select: { user1Id: true, user2Id: true },
    });
    const partners = new Map<string, Set<string>>();
    for (const m of history) {
      (partners.get(m.user1Id) ?? partners.set(m.user1Id, new Set()).get(m.user1Id)!).add(m.user2Id);
      (partners.get(m.user2Id) ?? partners.set(m.user2Id, new Set()).get(m.user2Id)!).add(m.user1Id);
    }

    return users.map((u) => this.toCandidate(u, partners.get(u.id) ?? new Set()));
  }

  async runMatching(): Promise<RunResult> {
    const startedAt = new Date().toISOString();
    const result: RunResult = {
      success: true,
      roundWeekStart: null,
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
      const weekStart = weekStartOf(new Date());
      const round = await prisma.matchRound.upsert({
        where: { weekStart },
        update: {},
        create: { weekStart },
      });
      result.roundWeekStart = weekStart.toISOString().slice(0, 10);

      const candidates = await this.getCandidates();
      result.eligibleUsers = candidates.length;
      console.log(`👥 ${candidates.length} candidates for round ${result.roundWeekStart}`);

      const allPairs: ScoredPair[] = [];
      const byCountry = this.groupBy(candidates, (u) => u.country);
      for (const [country, countryUsers] of Object.entries(byCountry)) {
        if (this.config.countriesWithoutRegions.includes(country)) {
          allPairs.push(...this.findPairsInGroup(countryUsers));
        } else {
          for (const regionUsers of Object.values(this.groupBy(countryUsers, (u) => u.region))) {
            allPairs.push(...this.findPairsInGroup(regionUsers));
          }
        }
      }
      allPairs.sort((x, y) => y.score - x.score);
      const pairs = allPairs.slice(0, this.config.maxMatchesPerRun);

      for (const { a, b } of pairs) {
        const [user1Id, user2Id] = [a.userId, b.userId].sort();
        const compatibility = this.calculateCompatibilityScore(a, b);
        try {
          await prisma.$transaction([
            prisma.match.create({
              data: {
                roundId: round.id,
                user1Id,
                user2Id,
                score: compatibility.score,
                factors: compatibility.factors as unknown as Prisma.InputJsonValue,
                expiresAt: new Date(Date.now() + MATCH_TTL_MS),
              },
            }),
            prisma.user.updateMany({ where: { id: { in: [user1Id, user2Id] } }, data: { lastMatchedAt: new Date() } }),
          ]);
          result.matchesCreated++;
          console.log(`✅ Match: ${a.name} ↔ ${b.name} (${compatibility.score})`);

          if (this.config.enableNotifications) {
            const sent = await Promise.all([
              notifyUser(a.telegramId, this.matchMessage(b)),
              notifyUser(b.telegramId, this.matchMessage(a)),
            ]);
            result.notificationsSent += sent.filter(Boolean).length;
            if (sent.some(Boolean)) {
              await prisma.match.updateMany({
                where: { roundId: round.id, user1Id, user2Id },
                data: { notifiedAt: new Date() },
              });
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("❌ Failed to create match:", message);
          result.errors.push(`Pair ${a.telegramId}-${b.telegramId}: ${message}`);
        }
      }

      // "skip next round" is consumed by this run
      await prisma.userSettings.updateMany({ where: { skipNextRound: true }, data: { skipNextRound: false } });

      const matched = new Set(pairs.flatMap((p) => [p.a.userId, p.b.userId]));
      result.unmatched = candidates.filter((c) => !matched.has(c.userId)).length;
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

  private matchMessage(other: Candidate): string {
    const where = [other.region, other.country].filter(Boolean).join(", ");
    const interests = other.interests.slice(0, 3).join(", ");
    return (
      `🎯 <b>Новое совпадение!</b>\n\n` +
      `<b>${other.name || "Путешественник"}</b>${where ? ` · ${where}` : ""}\n` +
      (interests ? `Интересы: ${interests}\n` : "") +
      `\nОткрой TravelMate, чтобы посмотреть профиль.`
    );
  }

  /** Fake complete profiles using the real reference lists. */
  async createMockUsers(count = 10) {
    const pick = <T,>(arr: readonly T[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    const created: string[] = [];
    try {
      for (let i = 1; i <= count; i++) {
        const available = LOCATIONS.filter((l) => l.available);
        const { country, region } = available[Math.floor(Math.random() * available.length)];
        const location = await prisma.location.upsert({
          where: { country_region: { country, region } },
          update: {},
          create: { country, region },
        });
        const labels = [
          ...pick(INTERESTS, 5).map((label) => ({ category: "interest", label })),
          ...pick(VALUES, 2).map((label) => ({ category: "value", label })),
          ...pick(MEETING_FORMATS, 2).map((label) => ({ category: "format", label })),
        ];
        await prisma.tag.createMany({ data: labels, skipDuplicates: true });
        const tags = await prisma.tag.findMany({
          where: { OR: labels.map((l) => ({ category: l.category, label: l.label })) },
        });
        const birthYear = new Date().getUTCFullYear() - (20 + Math.floor(Math.random() * 30));
        const telegramId = `mock_${Date.now().toString(36)}_${i}`;
        await prisma.user.create({
          data: {
            telegramId,
            username: `traveler${i}`,
            firstName: `Mock ${i}`,
            profile: {
              create: {
                name: `Mock User ${i}`,
                dateOfBirth: new Date(Date.UTC(birthYear, 0, 1)),
                gender: ["male", "female"][Math.floor(Math.random() * 2)],
                locationId: location.id,
                placesToVisit: pick(LOCATIONS.map((l) => l.label), 2),
                isComplete: true,
                tags: { create: tags.map((t) => ({ tagId: t.id })) },
              },
            },
          },
        });
        created.push(telegramId);
      }
      console.log(`✅ Created ${count} mock users`);
      return { success: true, count, telegramIds: created };
    } catch (error) {
      console.error("❌ Error creating mock users:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async getMatchingStats() {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalUsers, completeProfiles, totalMatches, pendingMatches, matchesToday, rounds, avg] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count({ where: { isComplete: true } }),
      prisma.match.count(),
      prisma.match.count({ where: { status: "pending" } }),
      prisma.match.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.matchRound.count(),
      prisma.match.aggregate({ _avg: { score: true } }),
    ]);
    return {
      totalUsers,
      completeProfiles,
      totalMatches,
      pendingMatches,
      matchesToday,
      rounds,
      avgScore: avg._avg.score ?? 0,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      config: this.config,
    };
  }

  /** Unagreed pairs past their deadline → not_met; pending past expiry → expired. Returns the expired count. */
  async cleanupExpiredMatches(): Promise<number> {
    await closeUnagreedMatches();
    const result = await prisma.match.updateMany({
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
