import { NextResponse } from 'next/server';
import { FIXTURE_STATES, getSiteState } from '../../../../lib/queries';
import type { FixtureStateId } from '../../../../lib/queries';

/**
 * GET /api/sites/[slug]?state=t3
 *
 * Everything known about one place.
 *
 * While the data is fixtures, `slug` is ignored and `state` picks a snapshot.
 * Once there's a database, `slug` selects the place and `state` becomes a
 * timestamp — "as it looked on this date" rather than "snapshot number three".
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await params;
  const requested = new URL(request.url).searchParams.get('state') ?? 't3';

  if (!FIXTURE_STATES.includes(requested as FixtureStateId)) {
    return NextResponse.json(
      { error: `Unknown state '${requested}'. Try one of: ${FIXTURE_STATES.join(', ')}` },
      { status: 400 },
    );
  }

  return NextResponse.json(getSiteState(requested as FixtureStateId));
}
