---
name: website-update
description: How to make any change to the Bodmin Lions website — content, photos, dates, layout or code. Every change goes on its own branch and pull request, which builds a preview site for the person to check before it is merged and goes live. Use this whenever you are about to edit, commit or publish anything in this repo.
---

# Updating the Bodmin Lions website

The live site (bodminlions.org.uk) is deployed from `main`. **Never commit or push to `main` directly.**
Every change goes through a pull request (PR). Each PR gets its own preview site, and goes live only when it
is merged. The people asking for changes are usually club members, not developers. Explain things in plain
English and give them links they can click, not commands.

## 1. Start a branch

```sh
git switch main && git pull --ff-only
git switch -c update/<short-slug>      # e.g. update/sleigh-dates-2026, update/news-fireworks-raised
```

If the working tree has uncommitted changes you didn't make, stop and ask before carrying on. One request
gets one branch and one PR. If someone asks for several unrelated things, ask whether they want separate
PRs. Separate PRs can go live independently, and a problem with one won't hold up the others.

## 2. Make the change

Follow CLAUDE.md for how each kind of content works: news posts, heroes, event dates, the grant form and so
on. Then:

- run `hugo --gc --minify` and fix every WARN or ERROR
- for layout, CSS or photo changes, look at the page with `hugo server` at desktop and phone widths
- if you changed `worker/`, run it locally with `hugo --gc --minify && npx wrangler dev`

## 3. Open the PR

```sh
git add <the files you changed>        # not `git add -A`: .codegraph/, fb_images/ etc. must stay out
git commit -m "<what changed, in plain words>"
git push -u origin HEAD
gh pr create --base main --title "<plain-English title>" --body "<body>"
```

Write the PR body for a club member:
- **What's changed:** one or two sentences, plus a bullet list of pages, each with its path, e.g. `/events/ten-tors/`.
- **Please check:** what to look at on the preview, e.g. "the new dates on the Ten Tors page, and the photo crop on a phone".
- Anything you weren't sure about, or that needs the club to confirm (dates, names, permission to name people).

End the body with the attribution line from the system reminder, if there is one.

## 4. Share the preview

The **Deploy** workflow builds the PR and posts a comment with the preview link:
`https://pr-<number>-bodmin-lions.bodmin-lions.workers.dev/`. To wait for it:

```sh
gh pr checks <number> --watch
```

Then send the person the preview link, with the exact pages to look at, and the PR link. If the check fails,
read the log (`gh run view <run-id> --log-failed`), fix the problem, and push to the same branch. The preview
updates itself.

Things to know about previews:
- They are hidden from search engines and say "preview" on the grant form.
- The grant form really sends email to the club from a preview. The subject starts "[TEST from preview site]".
  Only send a test application if the change touches the form.
- More changes on the same branch update the same preview and PR.

## 5. Merge — only when they say so

Wait for the person to say the preview looks right. Approving the PR or saying "merge it" counts; silence
doesn't. Then:

```sh
gh pr merge <number> --squash --delete-branch
git switch main && git pull --ff-only
gh run list --branch main --limit 1     # the production deploy; check it finished with ✓
```

Tell them it's live, with the link to the real page on bodminlions.org.uk.

If they want changes, make them on the same branch and go back to step 4. If they decide against the
change, close the PR (`gh pr close <number> --delete-branch`) rather than leaving it open.

## Don'ts

- Don't push to `main`, force-push, or merge without the person's OK.
- Don't mix unrelated changes into one PR.
- Don't add secrets, API keys or personal data that isn't meant to be public to the repo or the PR.
- Don't change `.github/workflows/`, `wrangler.jsonc` or the Cloudflare setup as part of a content update.
  Do those as their own PR, and say clearly what they affect.
