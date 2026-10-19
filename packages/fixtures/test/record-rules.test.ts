/**
 * One record is one artifact (contract 2.2.0). These pin the rules a record
 * follows, and the shape a record has when it arrives without an id.
 */
import { describe, expect, it } from 'vitest';
import { newSourceRecord, sourceRecord } from '@sagas/contracts';
import type { MediaRef } from '@sagas/contracts';

const written = {
  id: 'rec-1',
  siteId: 'site-001',
  contributorId: 'guest-abc',
  text: 'My great-grandmother cooked in the boarding house kitchen.',
  submission: 'submitted' as const,
  media: [] as MediaRef[],
  createdAt: '2026-10-16T16:00:00Z',
};

const file = (id: string, kind: MediaRef['kind']): MediaRef => ({
  id,
  recordId: 'rec-1',
  kind,
  storageKey: `uploads/${id}`,
  contentType: kind === 'image' ? 'image/jpeg' : 'application/octet-stream',
  byteSize: 1000,
  processing: 'ready',
  derivatives: [],
  createdAt: '2026-10-16T16:00:00Z',
});

describe('one record is one artifact', () => {
  it('accepts a written record with an empty media list', () => {
    expect(sourceRecord.safeParse(written).success).toBe(true);
  });

  it('accepts several files of one kind, like the pages of a scanned letter', () => {
    const letter = { ...written, text: undefined, note: 'A letter from 1952.', media: [file('p1', 'image'), file('p2', 'image')] };
    expect(sourceRecord.safeParse(letter).success).toBe(true);
  });

  it('refuses files of different kinds in one record', () => {
    const mixed = { ...written, note: 'A photo and a recording.', media: [file('a', 'image'), file('b', 'audio')] };
    const result = sourceRecord.safeParse(mixed);
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toMatch(/same kind/);
  });

  it('still needs a note on an image', () => {
    const photo = { ...written, text: undefined, media: [file('p1', 'image')] };
    expect(sourceRecord.safeParse(photo).success).toBe(false);
  });
});

describe('a record as it arrives', () => {
  it('needs no id, because whoever stores it decides the id', () => {
    const { id: _id, ...arriving } = written;
    expect(newSourceRecord.safeParse(arriving).success).toBe(true);
  });

  it('follows the same rules as a stored record', () => {
    const { id: _id, ...arriving } = written;
    expect(newSourceRecord.safeParse({ ...arriving, text: undefined }).success).toBe(false);
  });
});
