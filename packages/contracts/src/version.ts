/**
 * The contract revision. Bump this in the same commit as any change to the
 * shapes in this package, and add a line to CHANGELOG.md saying what changed
 * and what a consumer has to do about it.
 *
 * Forks pin to a tag, not to main. A team that started at v1.0 keeps building
 * against v1.0 until we agree at a sync to pull forward. A fixture or contract
 * change that lands mid-sprint without that conversation is a bug on our side,
 * not theirs.
 */
export const CONTRACT_VERSION = '1.0.0' as const;
