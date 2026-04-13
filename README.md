# Timeline Portfolio

A personal portfolio website built with Astro + TailwindCSS, designed to resemble modern Twitter's layout patterns.

## Features

- **Twitter-inspired layout**: three panes (left rail, center timeline, right context panel)
- **Responsive**: desktop three-pane layout, mobile single-pane feed with bottom navigation
- **Resume-driven content**: work history, projects, writing from your data
- **Dynamic right pane**: Now status + live GitHub activity
- **Contact form**: Email routing through Cloudflare Workers

## Tech Stack

- [Astro](https://astro.build/) - Static site generator
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting & Functions

## Demo

See it live at [https://mundeimmaculate.vercel.app](https://mundeimmaculate.vercel.app)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/immaculate-munde/timeline.git
cd timeline

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:4321 in your browser.

---

## Project Structure

```
timeline/
├── src/
│   ├── components/     # UI components (LeftPane, FeedPane, RightPane)
│   ├── layouts/       # Page layouts
│   ├── pages/         # Routes (index, /work, /projects, /writing, /contact)
│   ├── user/          # Your content (builder-log posts, site data)
│   ├── data/          # Default data types
│   ├── styles/        # Global styles
│   └── content.config.ts
├── functions/api/      # Server-side Functions for Cloudflare Pages
│   ├── github-activity.ts   # GitHub activity API
│   └── contact.ts          # Contact form handler
├── public/profile/    # Images, resume PDF
├── wrangler.toml      # Cloudflare configuration
└── .dev.vars.example # Environment variables template
```

---

## Customizing Your Data

All content is in `src/user/data/` - just edit markdown files.

### 1. Profile

Edit `src/user/data/profile.json`:

```json
{
  "name": "Your Name",
  "handle": "@yourhandle",
  "role": "Your Role",
  "bio": "Your bio",
  "avatar": "/profile/your-avatar.jpg",
  "github": "https://github.com/yourhandle",
  "x": "https://x.com/yourhandle",
  "linkedin": "https://linkedin.com/in/yourhandle"
}
```

### 2. Work History

Add markdown files to `src/user/data/work/`:

```markdown
---
company: Company Name
role: Software Engineer
location: City, Country
period: Jan 2020 - Present
startDate: '2020/01/01'
---

- Built feature X
- Led team of Y engineers
```

### 3. Projects

Add markdown files to `src/user/data/projects/`:

```markdown
---
name: Project Name
url: https://project-url.com
description: One-line description
period: 2024 - Present
startDate: '2024/01/01'
tags:
  - Rails
  - AI
---

- Feature 1
- Feature 2
```

### 4. Writing

Add markdown files to `src/user/data/writing/`:

```markdown
---
title: Your Post Title
url: /writing/post-slug
summary: Brief summary
date: '2024/03/15'
tags:
  - Topic
---

Your post content here.
```

### 5. Daily Builder Log

Add markdown files to `src/user/content/builder-log/`:

```markdown
---
date: 2026-04-15
contributionsTotal: 5
contributionsPublic: 3
contributionsPrivate: 2
hook: What happened
action: What you did
result: What happened
lesson: What you learned
---

Optional additional details.
```

### 6. About Page

Edit `src/user/data/about.md`.

### 7. Navigation

Edit `src/user/data/nav.json` to customize nav items.

---

## GitHub Token Setup

### Why You Need a Token

The GitHub activity API in the right pane uses GitHub's public API by default. Without a token:

- Rate limit: 60 requests/hour
- Limited to public events only

With a token:

- Rate limit: 5,000 requests/hour  
- Access to private events (if token has appropriate scopes)

### Creating a GitHub Token

1. Go to https://github.com/settings/tokens/new
2. Set expiration (recommended: 90 days)
3. Select scopes:
   - `repo` (full control of private repositories) - optional, only if you want private activity
   - `read:user` (read user profile data) - optional
   - No scope needed for public-only activity
4. Generate and copy the token

### Using the Token Locally

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit with your token
# Replace "replace_me" with your actual token
```

### Using the Token in Production

Add the variable in Cloudflare Pages settings:

- Variable name: `GITHUB_TOKEN`
- Value: your GitHub token

---

## Deploying to Cloudflare Pages

### Option 1: GitHub Actions (Recommended)

This repository includes a workflow that deploys on every push to master.

#### Setup

1. Go to your repo Settings > Secrets and variables > Actions
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN` - Get from Cloudflare Dashboard > Profile > API Tokens
     - Create Custom Token
     - Permissions: Pages (Read, Write)
     - Account resources: Your account
   - `CLOUDFLARE_ACCOUNT_ID` - Found in Cloudflare Dashboard URL

3. Push to master - deployment starts automatically

#### Manual Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=your-project-name
```

### Option 2: Wrangler CLI

```bash
# Install Wrangler
npm i -D wrangler

# Login to Cloudflare
npx wrangler login

# Create Pages project (first time only)
npx wrangler pages project create timeline --production-branch=master

# Deploy
npm run build
npx wrangler pages deploy dist --project-name=timeline
```

### Custom Domain

After deployment:

1. Go to Cloudflare Dashboard > Pages > your project > Custom domains
2. Add your domain (e.g., mundeimmaculate.vercel.app)
3. Update your DNS at your domain registrar

---

## Environment Variables Reference

### Development (.dev.vars)

```bash
CONTACT_FORWARD_TO=your-email@example.com
CONTACT_FROM=sender@example.com
GITHUB_TOKEN=ghp_your_token_here
```

### Cloudflare Pages Settings

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTACT_FORWARD_TO` | Yes | Email alias to forward contact form submissions |
| `CONTACT_FROM` | No | Sender address (default: contact.form@yourdomain.com) |
| `GITHUB_TOKEN` | No | GitHub token for API rate limits |
| `GITHUB_ACTIVITY_CACHE` | No | KV namespace for 10-minute caching |

### Adding KV Cache (Optional)

For 10-minute GitHub activity caching:

1. Create KV namespace: `wrangler kv:namespace create github-activity-cache`
2. Add to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "GITHUB_ACTIVITY_CACHE"
id = "your-kv-id"
```

---

## Contact Form (Optional)

The contact form at `/contact` sends emails through Cloudflare Email Routing.

### Setup

1. Enable Cloudflare Email Routing
2. Create a catch-all rule or specific alias
3. Set `CONTACT_FORWARD_TO` to your personal email

---

## License

[MIT](./LICENSE)