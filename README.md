# Bodmin Lions Club website (prototype)

A [Hugo](https://gohugo.io/) static site to replace the current site at bodminlions.x10.mx. It is
built for phones first, aims for WCAG 2.2 AA, and carries the structured data that search engines and AI
assistants use (schema.org `NGO` and `Event`, `sitemap.xml`, `robots.txt`, `llms.txt`).

No theme, no JavaScript, no cookies. The whole site is ordinary Markdown files.

## Editing content

| To change… | Edit |
| --- | --- |
| A page (Join, Contact, About…) | `content/<page>.md` |
| An event page and its next date | `content/events/<event>.md` — the `event:` block at the top |
| The "What's on" list | `data/calendar.yaml` — past dates drop off on the next build |
| Add a news post | new file `content/news/YYYY-MM-DD-short-title.md` |
| Officers, email, meeting details | `[params]` in `hugo.toml` |
| Photos | put them in `assets/images/` and reference them as `image: images/name.jpg` (they are resized and converted to WebP automatically) |

Every page needs a `description:` in its front matter — it becomes the Google snippet and the `llms.txt` summary.
Every photo needs `imageAlt:` text describing what it shows.

Non-technical editors can use GitHub's web editor (press `.` in the repo), or we can add
[Pages CMS](https://pagescms.org/) / Decap CMS later for a form-based editor.

## Run locally

```sh
hugo server
```

## How changes go live

Every change is a **pull request**. The Deploy workflow (`.github/workflows/deploy.yml`) builds each PR to its
own preview site, `https://pr-<number>-bodmin-lions.bodmin-lions.workers.dev/`, and posts the link on the PR.
Previews are hidden from search engines and don't affect the live site. Merging the PR deploys
bodminlions.org.uk. The live site also rebuilds nightly, so past dates drop off "What's on".

## Updating with Claude

The simplest way to keep the site up to date is to ask Claude (Claude Code, in this repo) in plain
English — "add a news post about the sleigh raising £5,000, with these photos". `CLAUDE.md` tells it
how the site is organised and the rules to follow.

## Deploy to Cloudflare (free, for the real domain)

The site runs as a **Cloudflare Worker with static assets** (`wrangler.jsonc`). Every page and photo is a
static file, which is free and unlimited; only the grant form (`/api/grant-request`, handled by
`worker/index.js`) runs code, well inside the free 100,000 requests a day. It isn't Cloudflare *Pages*
because Pages Functions can't send email.

`.github/workflows/deploy.yml` builds with Hugo and deploys on every push to `main` (a merged PR) and nightly
(so past dates drop off "What's on"). Pull requests get preview versions instead (see above). One-off setup:

1. Add the club's domain to Cloudflare (Websites → Add a domain) and switch its nameservers to Cloudflare.
2. **Email → Email Routing**: enable it, and add `bodmin.lions@outlook.com` as a destination address.
   Cloudflare emails that inbox a verification link — click it. Email Routing replaces the domain's MX
   records, so set up any forwarding (e.g. `info@` → the Outlook inbox) there too.
3. If the domain isn't `bodminlions.org.uk`, change `GRANT_FROM` in `wrangler.jsonc` and `baseURL` in `hugo.toml`.
4. My Profile → API Tokens → Create Token → template **Edit Cloudflare Workers** (the club's account only).
5. GitHub repo → Settings → Secrets and variables → Actions: add `CLOUDFLARE_API_TOKEN` (the token) and
   `CLOUDFLARE_ACCOUNT_ID` (on the Workers & Pages overview page). Until they exist the deploy step is skipped.
6. Push to `main` (or Actions → Deploy → Run workflow). Then, in the `bodmin-lions` Worker → Settings →
   Domains & Routes, add the custom domain.
7. Send a test application from `/funding/apply/` and check it arrives (look in Junk the first time).

To try the Worker locally: `hugo --gc --minify && npx wrangler dev` (emails are written to `.wrangler/tmp/email/`).

### Online grant application form

`/funding/apply/` is a plain HTML form (no JavaScript). It posts to `worker/index.js`, which checks it,
drops spam caught by a hidden "honeypot" field, and emails it to the club with the applicant as Reply-To.
Nothing is stored. Free-plan Email Routing can only send to verified addresses, which is all we need.
On PR previews the form works and really emails the club, with "[TEST from preview site]" in the subject.

`static/_headers` sets security and caching headers; `static/_redirects` maps old page addresses to new ones.

## Before go-live (club to confirm)

- [ ] Register a proper domain (e.g. `bodminlions.org.uk`, ~£10/year) in the club's name, with two officers holding the login.
- [ ] Confirm use of the Lions emblem (taken from Lions Clubs British Isles) follows the Lions brand guidelines.
- [ ] Ten Tors 2027 venue and entry form; sleigh routes and ASDA dates for 2026.
- [ ] Approve the Privacy page wording.
- [ ] Bring across older news and photos the club wants to keep.
- [ ] Put a redirect from the old x10 site to the new domain.
