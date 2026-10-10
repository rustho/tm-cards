import { randomUUID } from "node:crypto";

/**
 * Profile photos in Supabase Storage (server only).
 *
 * Files live in a public bucket under `<users.id>/<random uuid>.<ext>`, so a
 * URL cannot be guessed from a Telegram id, and every upload gets a new path
 * (safe to cache forever). `profiles.photo` stores the public URL.
 *
 * Talks to the Storage REST API with the service key, so no extra
 * dependency; the key never reaches the client.
 */

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class PhotoStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoStorageError";
  }
}

interface StorageConfig {
  url: string;
  key: string;
  bucket: string;
}

function getConfig(): StorageConfig | null {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key, bucket: process.env.SUPABASE_STORAGE_BUCKET || "profile-photos" };
}

function requireConfig(): StorageConfig {
  const config = getConfig();
  if (!config) throw new PhotoStorageError("Photo storage is not configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  return config;
}

export function isPhotoStorageConfigured(): boolean {
  return getConfig() !== null;
}

function authHeaders(config: StorageConfig): Record<string, string> {
  return { apikey: config.key, Authorization: `Bearer ${config.key}` };
}

function publicPrefix(config: StorageConfig): string {
  return `${config.url}/storage/v1/object/public/${config.bucket}/`;
}

/** Detects JPEG / PNG / WebP by magic bytes; the client-sent Content-Type is not trusted. */
export function detectImageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  const ascii = (from: number, to: number) => Array.from(bytes.subarray(from, to), (b) => String.fromCharCode(b)).join("");
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

/** Uploads a photo for `userId` (internal users.id) and returns its public URL. */
export async function uploadProfilePhoto(userId: string, bytes: Uint8Array): Promise<string> {
  const config = requireConfig();
  if (bytes.length === 0) throw new PhotoStorageError("Empty photo");
  if (bytes.length > MAX_PHOTO_BYTES) throw new PhotoStorageError("Photo is too large");
  const contentType = detectImageType(bytes);
  if (!contentType) throw new PhotoStorageError("Unsupported image format");

  const path = `${userId}/${randomUUID()}.${MIME_EXTENSIONS[contentType]}`;
  const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${path}`, {
    method: "POST",
    headers: {
      ...authHeaders(config),
      "Content-Type": contentType,
      "cache-control": "max-age=31536000",
    },
    body: bytes,
  });
  if (!response.ok) {
    throw new Error(`Storage upload failed: ${response.status} ${await response.text().catch(() => "")}`);
  }
  return publicPrefix(config) + path;
}

/** Object path inside the bucket when `url` is one of our photo URLs, otherwise null. */
function pathFromUrl(config: StorageConfig, url: string): string | null {
  const prefix = publicPrefix(config);
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

/** True when `url` points to a photo uploaded for this user. */
export function isOwnPhotoUrl(userId: string, url: string): boolean {
  const config = getConfig();
  if (!config) return false;
  const path = pathFromUrl(config, url);
  return path !== null && /^[^/]+\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path) && path.startsWith(`${userId}/`);
}

/** Best-effort removal of a previous photo; data URLs and foreign URLs are ignored. */
export async function deleteProfilePhoto(url: string | null | undefined): Promise<void> {
  const config = getConfig();
  if (!config || !url) return;
  const path = pathFromUrl(config, url);
  if (!path) return;
  try {
    const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}`, {
      method: "DELETE",
      headers: { ...authHeaders(config), "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [path] }),
    });
    if (!response.ok) console.warn(`⚠️ Photo delete failed (${response.status}): ${path}`);
  } catch (error) {
    console.warn("⚠️ Photo delete failed:", error instanceof Error ? error.message : error);
  }
}

/** Creates the public bucket if it does not exist yet (used by the migration script). */
export async function ensurePhotoBucket(): Promise<void> {
  const config = requireConfig();
  const existing = await fetch(`${config.url}/storage/v1/bucket/${config.bucket}`, { headers: authHeaders(config) });
  if (existing.ok) return;
  const response = await fetch(`${config.url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders(config), "Content-Type": "application/json" },
    body: JSON.stringify({
      id: config.bucket,
      name: config.bucket,
      public: true,
      file_size_limit: MAX_PHOTO_BYTES,
      allowed_mime_types: Object.keys(MIME_EXTENSIONS),
    }),
  });
  if (!response.ok) {
    throw new Error(`Bucket creation failed: ${response.status} ${await response.text().catch(() => "")}`);
  }
  console.log(`🪣 Created storage bucket "${config.bucket}"`);
}
