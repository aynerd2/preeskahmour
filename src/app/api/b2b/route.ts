import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { b2bSchema } from '@/lib/validators';
import { clientKey, limit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/** Corporate and bulk enquiries. Lands in /studio → Enquiries. */
export async function POST(request: Request) {
  const rate = limit(clientKey(request, 'b2b'), 4, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Give it a minute and try again.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = b2bSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the form.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  if (parsed.data.website) return NextResponse.json({ ok: true });

  const data = parsed.data;

  // `neededBy` arrives as a free-text date from a <input type="date"> or a
  // typed month. Only store it if it actually parses.
  let neededBy: Date | null = null;
  if (data.neededBy) {
    const parsedDate = new Date(data.neededBy);
    if (!Number.isNaN(parsedDate.getTime())) neededBy = parsedDate;
  }

  try {
    await prisma.b2BEnquiry.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        industry: data.industry || null,
        headcount: data.headcount ?? null,
        garmentTypes: data.garmentTypes,
        neededBy,
        budgetNote: data.budgetNote || null,
        message: data.message,
      },
    });
  } catch (error) {
    console.error('[api/b2b] write failed:', error);
    return NextResponse.json(
      { error: 'We could not save that. Email us directly and we will pick it up.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
