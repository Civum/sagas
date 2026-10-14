import { copyHash } from '../src/approval';
import { content } from '../src/content';

// Prints the fingerprint of the current copy. When the sponsor approves the
// copy, put this value in `approval.copySha256` in src/content.ts.
console.log(copyHash(content.copy));
