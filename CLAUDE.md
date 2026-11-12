# Bodmin Lions Club website — notes for Claude

This repo is the Bodmin Lions Club website: a Hugo static site, deployed by `.github/workflows/deploy.yml`
to Cloudflare (a Worker serving `public/`, see `wrangler.jsonc`) on every push to `main`, and nightly.

**Every change is a pull request with its own preview site. Follow the `website-update` skill**
(`.claude/skills/website-update/SKILL.md`): branch, PR, share the preview link, and merge only when the person says so.
Never push to `main` directly.

Club members will usually ask for content changes in plain English
("add a news post about…", "change the sleigh dates", "add these photos"). Treat them as non-technical.

## How to make common changes

- **News post:** a folder `content/news/YYYY-MM-DD-short-slug/` containing `index.md` (front matter:
  `title`, `date`, `description` — one sentence under 160 characters) and the post's photos.
  Put photos in the text as `![what the photo shows](photo.jpg)`; several in a row go inside
  `{{< gallery >}} … {{< /gallery >}}`. The first photo becomes the thumbnail and social-media image.
  Hugo resizes everything and strips camera metadata. Write in plain British English, short paragraphs.
  Use `dateLabel: "March 2026"` when the exact date isn't known.
- **Migrated posts** (`migrated: true`) came from the old site in Nov 2026. 64 photos still have placeholder
  alt text ("Photo 3: <title>") — when touching a post, look at the photo and replace it with a real description.
- **Page hero photos:** set `hero: images/heroes/<file>.jpg`, `heroAlt: "…"`, optional `heroCredit: "Photo: …"`
  and `heroY` (vertical focus: 0, 10, 20 … 100 only; 50 = centre, smaller shows more of the top, larger more of the bottom).
  Photos under 1300px wide automatically use a split layout (photo on the right half) so they aren't stretched and blurred in the page's front matter.
  Before adding a photo to `assets/images/heroes/`, resize it to at most 1920px and strip metadata:
  `magick in.jpg -auto-orient -resize '1920x1920>' -strip -interlace JPEG -quality 82 out.jpg`.
  Check the crop in a browser at desktop and phone widths. `fb_images/` is a git-ignored scratch folder.
- **Event dates:** update the `event:` block in `content/events/<event>.md` (`start` is ISO date,
  `when` is the human-readable date) AND the matching line in `data/calendar.yaml`.
- **Officers, email, meeting time:** `[params]` in `hugo.toml`; also check `content/about.md` and `content/contact.md`.
- **Grant application form:** the questions are in `layouts/_default/grant-form.html`; the same field
  names, labels and required/max-length rules are in `FIELDS` in `worker/index.js`. Change both together.
  Keep `static/docs/grant-request-form.pdf` in step with the form.
- **Internal links** in Markdown are written root-relative (`/join/`); a render hook makes them work under any base path.
  In templates use `relURL` / `.RelPermalink`, never a hard-coded leading `/`.

## Rules

- Every page needs a unique `description` (it is the Google snippet and feeds `llms.txt`).
- Every image needs meaningful `imageAlt` text. Never leave it empty for a content photo.
- Keep one source of truth for a fact (dates, meeting day) — don't repeat it in several pages if a param can be used.
- Don't add JavaScript, trackers, cookies or third-party embeds without the club agreeing; the privacy page says there are none.
- Use the Lions emblem only as supplied in `assets/images/lions-emblem.png` (don't recolour or distort it).
- Before committing run `hugo --gc --minify` and fix any WARN/ERROR.
- Changes go live by merging a PR (see the `website-update` skill), never by pushing to `main`.
- Check people named in news posts are happy to be named, particularly children (first names only or none).
