import { NextResponse } from 'next/server';
import { FIXTURE_STATES, getSiteState } from '../../../../lib/queries';
import type { FixtureStateId } from '../../../../lib/queries';

/**
 * GET /api/sites/[slug]?state=t3
 *
 * Everything known about one place.
 *
 * `slug` selects the place. `state` picks a snapshot while the data is
 * fixtures, and becomes a timestamp once there is a database, so it reads as
 * "as it looked on this date" rather than "snapshot number three".
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const requested = new URL(request.url).searchParams.get('state') ?? 't3';

  if (!FIXTURE_STATES.includes(requested as FixtureStateId)) {
    return NextResponse.json(
      { error: `Unknown state '${requested}'. Try one of: ${FIXTURE_STATES.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(getSiteState(slug, requested as FixtureStateId));
  } catch {
    return NextResponse.json({ error: `No site with slug '${slug}'.` }, { status: 404 });
  }
}
