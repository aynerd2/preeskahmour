import 'server-only';

import { v2 as cloudinary } from 'cloudinary';

/**
 * Image uploads for /studio.
 *
 * Uploads are signed server-side and sent to Cloudinary straight from the
 * browser, so a 6MB photograph never travels through this app's server
 * (which on Vercel would hit the serverless body limit anyway). The signature
 * is short-lived and scoped to one folder.
 *
 * Cloudinary is optional. When the keys are absent, /studio falls back to
 * accepting a pasted image URL — Prisca can still run the whole site, and
 * placeholders stay in place until real photography exists. Every image
 * field in the studio therefore accepts either an upload or a URL.
 */

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

/**
 * A signature the browser posts to Cloudinary alongside the file.
 * `folder` keeps studio uploads organised by what they belong to.
 */
export function createUploadSignature(folder: string): UploadSignature {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured.');
  }

  const client = configure();
  const timestamp = Math.round(Date.now() / 1000);
  const safeFolder = `preeskahmour/${folder.replace(/[^a-z0-9/_-]/gi, '')}`;

  const signature = client.utils.api_sign_request(
    { timestamp, folder: safeFolder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: safeFolder,
  };
}

/** Deletes an asset by its public id. Best-effort: never blocks a save. */
export async function deleteAsset(publicId: string) {
  if (!isCloudinaryConfigured()) return;
  try {
    await configure().uploader.destroy(publicId);
  } catch (error) {
    console.error('[cloudinary] delete failed:', (error as Error).message);
  }
}

/**
 * Extracts the public id from a Cloudinary URL, so an image replaced in the
 * studio can have its predecessor cleaned up.
 */
export function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+$/i);
  return match?.[1] ?? null;
}
