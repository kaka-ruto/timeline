# Kaka Ruto Timeline Portfolio

A personal portfolio website built with Astro + TailwindCSS, designed to resemble modern Twitter's layout patterns.

## Highlights
- Twitter-inspired layout architecture.
- Responsive design:
  - Desktop (`lg`/`xl`): three panes (left rail, center timeline, right context panel)
  - Mobile: single-pane feed with bottom navigation
- Resume-driven content and profile media.
- Dynamic right pane:
  - Now status
  - Live GitHub public activity

## Tech Stack
- [Astro](https://astro.build/)
- [TailwindCSS](https://tailwindcss.com/)

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Project Structure
```text
src/
  components/
    LeftPane.astro
    FeedPane.astro
    RightPane.astro
  data/
    site.ts
  layouts/
    AppShell.astro
  pages/
    index.astro
    projects/index.astro
    writing/index.astro
    about/index.astro
public/
  profile/
    avatar.jpg
    kaka.jpeg
    KakaRutoResume.pdf
```

## Editing Content
Update data in `src/data/site.ts`:
- profile metadata
- navigation
- timeline/feed cards
- now status
- GitHub username/events config

## Contact Form (Cloudflare Email Routing)
Contact form page: `/contact`  
Server endpoint: `functions/api/contact.ts`

Set these environment variables in Cloudflare Pages project settings:
- `CONTACT_FORWARD_TO`: your Cloudflare Email Routing alias (for example `contact@kakaruto.com`)
- `CONTACT_FROM` (optional): sender address for outgoing form notifications (default: `contact.form@kakaruto.com`)

Recommended Cloudflare setup:
1. In Email Routing, create alias `contact@kakaruto.com` forwarding to your private inbox.
2. In Pages, add `CONTACT_FORWARD_TO=contact@kakaruto.com`.
3. Deploy.

## Cloudflare Pages Deployment
1. Install Wrangler and login:
```bash
npm i -D wrangler
npx wrangler login
```
2. Create Pages project (first time only):
```bash
npx wrangler pages project create kakaruto-timeline --production-branch=master
```
3. Build and deploy:
```bash
npm run build
npx wrangler pages deploy dist --project-name=kakaruto-timeline
```
4. In Cloudflare Pages settings, attach custom domain `kakaruto.com`.

## License
[MIT](./LICENSE)

## GitHub Actions Deployment
A workflow is included at `.github/workflows/deploy-cloudflare-pages.yml`.

Add these repository secrets in GitHub:
- `CLOUDFLARE_API_TOKEN` (Pages Write permission)
- `CLOUDFLARE_ACCOUNT_ID`

Then every push to `master` will build and deploy to Cloudflare Pages.
