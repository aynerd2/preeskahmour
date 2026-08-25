import { NextResponse } from 'next/server';

import { estimateMeasurements } from '@/lib/measurements';
import { estimateSchema } from '@/lib/validators';
import { clientKey, limit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Runs the measurement heuristic.
 *
 * The maths is pure and could run in the browser — it lives behind an
 * endpoint so that the proportion table stays server-side and can be
 * replaced (with a fitted model, a scanning partner, anything) without
 * shipping a new client bundle. The response shape is the contract.
 */
export async function POST(request: Request) {
  const rate = limit(clientKey(request, 'estimate'), 20, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Give it a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = estimateSchema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        error:
          issues.heightCm?.[0] ??
          issues.weightKg?.[0] ??
          'Check the height and weight you entered.',
        issues,
      },
      { status: 422 },
    );
  }

  const result = estimateMeasurements({
    heightCm: parsed.data.heightCm,
    weightKg: parsed.data.weightKg,
    fitPreference: parsed.data.fitPreference,
    braBandCm: parsed.data.braBandCm ?? undefined,
    torsoLength: parsed.data.torsoLength,
    shoulderSlope: parsed.data.shoulderSlope,
    pregnancyWeeks: parsed.data.pregnancyWeeks ?? undefined,
  });

  return NextResponse.json({
    values: result.values,
    tolerance: result.tolerance,
    confidence: result.confidence,
    notes: result.notes,
    // Restated on every response so no client can present this as a scan.
    disclaimer:
      'Estimated from a tailoring proportion table, not a body scan. We confirm every estimated set with you before cutting.',
  });
}
