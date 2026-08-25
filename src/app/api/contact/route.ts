import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validators';
import { clientKey, limit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Contact and newsletter capture. Both land in ContactMessage so Prisca has
 * one inbox in /studio rather than two places to check.
 */
export async function POST(request: Request) {
  const rate = limit(clientKey(request, 'contact'), 5, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Too many messages. Give it a minute and try again.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the form.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot: report success so the bot has nothing to learn from, and write
  // nothing to the database.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, topic, message } = parsed.data;

  try {
    await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, topic, message },
    });
  } catch (error) {
    console.error('[api/contact] write failed:', error);
    return NextResponse.json(
      { error: 'We could not save that. Email us directly and we will pick it up.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
