/**
 * The model, in five sentences.
 *
 * A claim is something a person says about a record or about another claim. It
 * targets exactly one thing, a record or a claim. A claim that targets a claim
 * either disputes it or extends it, and a dispute also carries its reasoning. A
 * claim's `details` are the excerpts of its target it points at, and with none it's
 * about all of it. A detail is an excerpt of a claim that another claim points at,
 * so `detailsOf` works them out and nothing else makes one.
 *
 * So a claim's target, relation and details are its edge, and the graph stores that
 * edge nowhere else. `repliesTo` reads the replies to a claim off the claims.
 *
 * ---
 *
 * What a scorer reads and what it returns.
 *
 * A list of counts can't say which detail a dispute landed on, whether two
 * claims came from the same record, or who brought what, and those are most
 * of what scoring is about. So the scorer reads the graph itself. The shapes
 * it returns (`claimScore` and its terms) come from `@sagas/contracts`, so the
 * experience layer renders exactly what a scorer produces.
 *
 * This is the input the intelligence layer can expect to have. How it plugs
 * into a scorer (your own structures, your own tables, things worked out from
 * it first) is the scorer's business. The rules fix only what goes in and what
 * comes out.
 */
import { z } from "zod";

import type { ClaimDetail, Excerpt } from "@sagas/contracts";
import {
  checkReply,
  claimEvidence,
  claimReference,
  claimRelation,
  claimScore,
  claimTarget,
  detailId,
  detailScore,
  excerptIsIn,
  isExcerpt,
  sameExcerpt,
  scoreTerm,
  targetDetail,
} from "@sagas/contracts";

const timestamp = z.string().datetime();

/** Something a person handed over. Its role (source or evidence) comes from how claims use it. */
export const recordNode = z.object({
  id: z.string(),
  contributorId: z.string(),
  kind: z.enum(["audio", "video", "image", "document", "text", "link"]),
  createdAt: timestamp,
  /**
   * Audio and video only. False means nobody can read its subject matter yet,
   * so nothing that depends on what it says can come from it.
   */
  transcribed: z.boolean().optional(),
  /**
   * Audio and video only: the stretches that have a transcript, in seconds.
   * A claim citing a window that isn't covered gets nothing yet from the
   * part of its score that depends on what it says.
   */
  transcribedWindows: z
    .array(z.object({ start: z.number(), end: z.number() }))
    .optional(),
  /** The same file handed over twice has the same hash. */
  contentHash: z.string().optional(),
  /**
   * Where the record was made, from the photo's metadata, when the person
   * chose to keep it. Raw coordinates for now. People choose whether to keep
   * the location, show only its distance from the place, or remove it, so
   * this will often be missing and its shape may change.
   */
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});
export type RecordNode = z.infer<typeof recordNode>;

export const claimNode = z
  .object({
  id: z.string(),
  contributorId: z.string(),
  createdAt: timestamp,
  text: z.string(),
  /** The record this claim's thread starts from. Claims with the same one are one thread. */
  sourceRecordId: z.string(),
  /** What this claim points into: a record, or another claim. */
  target: claimTarget,
  /** Whether it disputes or extends the claim it targets. Only a claim that targets a claim has one. */
  relation: claimRelation.optional(),
  /** Why, on a dispute. The people who write claims choose these, so the scorer never guesses them from the words. */
  reasoning: z.string().optional(),
  /** The excerpts or stretches it points at in its target. Empty means all of it. */
  details: z.array(targetDetail),
  /**
   * True when the claim was given in another language and rendered. It must
   * never lower a score; the rules check that. There's no field for where a
   * contributor lives, so distance can't lower a score either.
   */
  translated: z.boolean().optional(),
  /** Typed links inside the claim's text. Nothing scores them yet. */
  references: z.array(claimReference),
  /**
   * Records attached to back the claim up. They back what the claim targets. If a
   * claim targets an evidence record, that starts a new thread with that record as
   * its source.
   */
  evidence: z.array(claimEvidence),
  })
  .superRefine(checkReply);
export type ClaimNode = z.infer<typeof claimNode>;

/**
 * A light signal a reader leaves on a claim. Not a vote. These are frequent
 * and light, so they may end up arriving through their own endpoint as they
 * happen, with scoring reading running totals. They're in the graph for now so
 * the rules can test what they do.
 */
export const passover = z.object({
  claimId: z.string(),
  contributorId: z.string(),
  kind: z.enum(["sounds_right", "dont_know", "dont_care"]),
  createdAt: timestamp,
});
export type Passover = z.infer<typeof passover>;

/**
 * Who contributed. A guest profile is the normal case. What a profile has done
 * is in the graph above; who they are is never here.
 */
export const profile = z.object({
  id: z.string(),
  guest: z.boolean(),
});
export type Profile = z.infer<typeof profile>;

export const scoringGraph = z
  .object({
  siteId: z.string(),
  /** "Now", for anything measured in time. */
  asOf: timestamp,
  records: z.array(recordNode),
  claims: z.array(claimNode),
  passovers: z.array(passover),
  profiles: z.array(profile),
  })
  .superRefine((g, ctx) => {
    const claims = new Map(g.claims.map((c) => [c.id, c]));
    const records = new Set(g.records.map((r) => r.id));
    const problem = (message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    for (const c of g.claims) {
      if (c.target.type === "record") {
        if (!records.has(c.target.id))
          problem(`claim ${c.id} targets record ${c.target.id}, which isn't in the graph`);
        continue;
      }
      const target = claims.get(c.target.id);
      if (!target) {
        problem(`claim ${c.id} targets claim ${c.target.id}, which isn't in the graph`);
        continue;
      }
      for (const d of c.details) {
        if (isExcerpt(d.at) && !excerptIsIn(target.text, d.at))
          problem(`claim ${c.id} points at "${d.at.text}", which isn't at that position in ${target.id}`);
      }
    }
  });
export type ScoringGraph = z.infer<typeof scoringGraph>;

/** The claims that dispute or extend this one, in the order they appear in the graph. */
export const repliesTo = (graph: ScoringGraph, claimId: string): ClaimNode[] =>
  graph.claims.filter((c) => c.target.type === "claim" && c.target.id === claimId);

/** Whether a reply points at exactly these words of the claim it targets. */
export const pointsAt = (reply: ClaimNode, e: Excerpt): boolean =>
  reply.details.some((d) => isExcerpt(d.at) && sameExcerpt(d.at, e));

/**
 * A claim's details, worked out from what points at it. The same words in the same
 * place are one detail, and a claim nothing points at has none. A reply about the
 * whole claim points at nothing in particular, so it makes none. Your score has one
 * result for each of these, with this id.
 */
export function detailsOf(graph: ScoringGraph, claimId: string): ClaimDetail[] {
  const excerpts: Excerpt[] = [];
  for (const reply of repliesTo(graph, claimId)) {
    for (const { at } of reply.details) {
      if (isExcerpt(at) && !excerpts.some((e) => sameExcerpt(e, at)))
        excerpts.push(at);
    }
  }
  return excerpts.map((excerpt) => ({
    id: detailId(claimId, excerpt),
    excerpt,
  }));
}

/* ------------------------------------------------------------------ */
/* What comes back                                                      */
/* ------------------------------------------------------------------ */

/** The score shapes are the contract's, so a scorer and a page agree. */
export const term = scoreTerm;
export type Term = z.infer<typeof term>;
export { detailScore, claimScore, detailId };
export { contests, findExcerpt, isExcerpt, sameExcerpt } from "@sagas/contracts";
export type DetailScore = z.infer<typeof detailScore>;
export type ClaimScore = z.infer<typeof claimScore>;

/**
 * A detail of one claim that looks like what a claim in another thread says. For
 * this semester a match counts straight away, with the weight coming from the
 * records behind it. That's a temporary choice. Whether a person should confirm
 * first is a question for next semester.
 */
export const match = z.object({
  claimId: z.string(),
  detailId: z.string(),
  matchesClaimId: z.string(),
  similarity: z.number().min(0).max(1),
});
export type Match = z.infer<typeof match>;

export const scoringResult = z.object({
  claims: z.array(claimScore),
  matches: z.array(match),
});
export type ScoringResult = z.infer<typeof scoringResult>;

/** What you build. */
export interface Scorer {
  score(graph: ScoringGraph): ScoringResult;
  /** How alike two pieces of text are, from 0 to 1. */
  similarity(a: string, b: string): number;
}
