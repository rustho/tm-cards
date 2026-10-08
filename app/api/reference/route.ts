import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse } from "@/lib/auth";
import { TAG_CATEGORIES, type TagCategory } from "@/lib/profileDto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/reference — active tags grouped by category and locations grouped by country.
 * Same shape as the constants in models/types.ts so the wizard can switch to it later.
 */
export async function GET(request: NextRequest) {
  try {
    await authenticate(request);
    const [tags, locations] = await Promise.all([
      prisma.tag.findMany({ where: { isActive: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { label: "asc" }] }),
      prisma.location.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { country: "asc" }, { region: "asc" }] }),
    ]);

    const tagsByField: Record<string, string[]> = { interests: [], values: [], meetingFormats: [] };
    for (const tag of tags) {
      const field = TAG_CATEGORIES[tag.category as TagCategory];
      if (field) tagsByField[field].push(tag.label);
    }

    const byCountry = new Map<string, string[]>();
    for (const loc of locations) {
      const regions = byCountry.get(loc.country) ?? [];
      if (loc.region) regions.push(loc.region);
      byCountry.set(loc.country, regions);
    }

    return NextResponse.json({
      tags: tagsByField,
      locations: Array.from(byCountry, ([country, regions]) => ({ country, regions })),
    });
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching reference data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
