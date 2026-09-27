import { NextResponse } from 'next/server';
import { listSites } from '../../../lib/queries';

/**
 * GET /api/sites
 *
 * Every place, for the map.
 *
 * TODO: takes a bounding box, so the map asks for what's on screen instead of
 * everything. TODO: cache this. It changes rarely and gets hit constantly.
 */
export function GET() {
  return NextResponse.json({ sites: listSites() });
}
