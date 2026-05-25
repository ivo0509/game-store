import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const endpoint = process.env.R2_URL;
const bucket = process.env.R2_BUCKET;
const publicUrl = process.env.R2_PUBLIC_URL;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (!endpoint || !bucket || !publicUrl || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 storage is not configured. Set R2_URL, R2_BUCKET, R2_PUBLIC_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY."
    );
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return cachedClient;
}

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadImageToR2(
  buffer: Buffer,
  contentType: string,
  prefix = "covers"
): Promise<{ url: string; key: string }> {
  const ext = ALLOWED_IMAGE_TYPES[contentType];
  if (!ext) {
    throw new Error(
      `Unsupported image type. Allowed: ${Object.keys(ALLOWED_IMAGE_TYPES).join(", ")}`
    );
  }
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File too large. Maximum size is ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`
    );
  }

  const client = getClient();
  const key = `${prefix}/${randomUUID()}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return { url: `${publicUrl!.replace(/\/$/, "")}/${key}`, key };
}

/**
 * Deletes an object from R2 by its public URL. Returns true on success,
 * false if the URL does not belong to the configured R2 bucket. Silently
 * ignores deletion errors (best-effort cleanup).
 */
export async function deleteR2ObjectByUrl(url: string): Promise<boolean> {
  if (!url || !publicUrl) return false;

  const normalizedBase = publicUrl.replace(/\/$/, "") + "/";
  if (!url.startsWith(normalizedBase)) return false;

  const key = url.slice(normalizedBase.length);
  if (!key) return false;

  try {
    const client = getClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket!,
        Key: key,
      })
    );
    return true;
  } catch (err) {
    console.error("[deleteR2ObjectByUrl]", err);
    return false;
  }
}
