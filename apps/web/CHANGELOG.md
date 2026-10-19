# Changelog: the experience layer

What this team has made work, newest first. Add a line in the same pull request
whenever something works that someone could see. Anything here since the last
specification meeting is what gets demoed.

The `CHANGELOG.md` at the root of the repository records the shared contract
and the shared docs. Leave it alone. Upstream changes it, so editing it means a
conflict on a later pull.

## Format

```
## YYYY-MM-DD

- What works now, in a sentence a visitor would understand. (#pull request number, who)
```

## 2026-10-16

- Every merge now builds the landing page and runs a Cloudflare dry run automatically, without publishing anything, so the page can go live as soon as the copy is approved. (#19, Ema)

## 2026-10-14

- The landing page builds and runs locally as a draft: it shows a draft banner, labels invented examples, and refuses a release build until the copy is approved. (#12, Ema with Canon)
