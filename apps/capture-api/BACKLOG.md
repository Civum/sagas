# Content layer backlog

Stories for this layer. I'll add more on Thursdays, starting 5 November.

**How to read a story.** Each `###` heading is one story. If you track work in
GitHub issues, you can paste a story into one as it is. **Goal** says what it's
for, **Done when** is what we check, **Not in this story** says what to leave out,
and **Status** says whether it can start now (**Ready**) or comes later, in the
order below (**Later**).

The steps in `docs/PHASE-2-CONTENT-LAYER.md` come first. These stories follow
them.

---

### C1 · A contributor can record at a site, and sees the terms first

**Status:** Later, after the new record fields from contract 2.4.0.

**Goal.** Someone standing at a place opens the capture app on their phone,
records what they know about it, and hands it over. The first time they
contribute, they see the terms and accept them before anything is submitted.

**Done when:**
- A guest sees `docs/TERMS.md` before their first record, and again when the
  version changes. Accepting stores the version on their profile
  (`termsAcceptedVersion`).
- They can record audio in the browser, play it back, and then submit it.
- The record is attached to a site, and stores the terms version it was made
  under (`termsVersion`) and the contributor's choices (`choices`).
- It works from a phone on the same wifi. Browsers only allow the microphone on
  HTTPS pages or on `localhost`, so a phone opening the laptop's `http://` address
  gets no microphone. Serving the app over HTTPS is part of this story.

**Not in this story.** Recording anybody else's story. Test it with your own
voice, because recordings of other people stay out of the app for now.

### C2 · Black out personal details before saving

**Status:** Later, if you have the capacity.

**Goal.** Documents people hand over often carry names, phone numbers and email
addresses that have nothing to do with the place. A contributor can black those
out before the file is saved.

**Done when:**
- A contributor can mark areas on a scanned page or a photo and black them out.
- The file that goes to storage has the marked areas removed from its pixels, so
  no one can recover them by lifting a layer off the image.
- You test it with a document you invent yourselves, with made-up contact details.

**Not in this story.** Finding personal details automatically, and PDFs with text
you can select, which need more than covering the page image.
