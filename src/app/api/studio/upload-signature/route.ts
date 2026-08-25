import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { createUploadSignature, isCloudinaryConfigured } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const bodySchema = z.object({
  folder: z.string().trim().min(1).max(60).regex(/^[a-z0-9/_-]+$/i, 'Invalid folder'),
});

/**
 * Hands the studio a short-lived Cloudinary signature so the browser can
 * upload directly. Admin only — an open signing endpoint would let anyone
 * upload into the brand's media library.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          'Cloudinary is not configured. Paste an image URL instead, or add the keys to .env.',
        configured: false,
      },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid folder.' }, { status: 422 });
  }

  try {
    return NextResponse.json(createUploadSignature(parsed.data.folder));
  } catch (error) {
    console.error('[studio/upload-signature] failed:', error);
    return NextResponse.json({ error: 'Could not sign that upload.' }, { status: 500 });
  }
}
