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

## Preview on GitHub Pages

Every push to `main` builds and publishes the site to
https://miketrebilcock.github.io/bodmin-lions/ via `.github/workflows/pages.yml`. It also rebuilds
nightly so past dates drop off. The preview carries a `noindex` tag (`HUGO_PARAMS_PREVIEW`) so it
doesn't compete with the real site in search results.

## Updating with Claude

The simplest way to keep the site up to date is to ask Claude (Claude Code, in this repo) in plain
English — "add a news post about the sleigh raising £5,000, with these photos". `CLAUDE.md` tells it
how the site is organised and the rules to follow.

## Deploy to Cloudflare Pages (free, for the real domain)

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → choose this repo.
2. Framework preset **Hugo**. Build command `hugo --gc --minify`, output directory `public`.
3. Environment variable `HUGO_VERSION` = `0.168.0`.
4. Add the custom domain (e.g. `bodminlions.org.uk`) under the project's Custom domains.
5. Optional: create a Deploy Hook and call it nightly so the calendar stays current.

`static/_headers` sets security and caching headers; `static/_redirects` maps old page addresses to new ones.

## Before go-live (club to confirm)

- [ ] Meeting day: the old site says **first** Monday on the home page and **second** Monday on the contact page.
- [ ] Register a proper domain (e.g. `bodminlions.org.uk`, ~£10/year) in the club's name, with two officers holding the login.
- [ ] Confirm use of the Lions emblem (taken from Lions Clubs British Isles) follows the Lions brand guidelines.
- [ ] Ten Tors 2027 venue and entry form; sleigh routes and ASDA dates for 2026.
- [ ] Approve the Privacy page wording.
- [ ] Bring across older news and photos the club wants to keep.
- [ ] Put a redirect from the old x10 site to the new domain.
