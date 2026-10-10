import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import {
  deleteProfilePhoto,
  isPhotoStorageConfigured,
  MAX_PHOTO_BYTES,
  PhotoStorageError,
  uploadProfilePhoto,
} from "@/lib/photoStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/profile/photo — body is the raw image (JPEG/PNG/WebP, ≤ 2 MB;
 * the wizard sends a 1280px JPEG from lib/imageUtils.ts). Uploads it to
 * Supabase Storage, saves the URL to the caller's profile, removes the
 * previous file and returns `{ url }`.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!isPhotoStorageConfigured()) {
      return NextResponse.json({ error: "Photo storage is not configured" }, { status: 503 });
    }

    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "Photo is too large" }, { status: 413 });
    }
    const bytes = new Uint8Array(await request.arrayBuffer());

    const user = await ensureUser(auth);
    const url = await uploadProfilePhoto(user.id, bytes);

    const previous = await prisma.profile.findUnique({ where: { userId: user.id }, select: { photo: true } });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { photo: url },
      create: { userId: user.id, photo: url },
    });
    if (previous?.photo && previous.photo !== url) await deleteProfilePhoto(previous.photo);

    console.log(`🖼️ Photo uploaded for user ${user.id}`);
    return NextResponse.json({ url });
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    if (error instanceof PhotoStorageError) {
      const status = error.message === "Photo is too large" ? 413 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("Error uploading photo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
