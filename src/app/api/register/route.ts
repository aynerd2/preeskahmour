import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';
import { clientKey, limit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rate = limit(clientKey(request, 'register'), 5, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Give it a minute.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the form.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { name, email, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Deliberately specific. Account enumeration is a real concern on a
      // login form; on a signup form, telling someone their address is
      // already registered is the only way they can act on it — and the
      // alternative (a silent no-op) reliably produces support tickets.
      return NextResponse.json(
        { error: 'There is already an account with that email. Sign in instead.' },
        { status: 409 },
      );
    }

    await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        // Role is never taken from the request body — a new account is always
        // a customer, and admin is granted in the database.
        role: 'CUSTOMER',
        passwordHash: await hashPassword(password),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/register] failed:', error);
    return NextResponse.json({ error: 'Could not create that account.' }, { status: 500 });
  }
}
