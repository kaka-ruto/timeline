## Auto-Generation Pipeline for Builder-Log Entries

### Architecture

A GitHub Actions workflow runs daily, fetches your GitHub activity, uses the OpenCode Go API (`deepseek-v4-flash`) to generate rich H.A.R.L. entries, and commits them — triggering the deploy.

```
Schedule (23:00 Nairobi)
        │
        ▼
  Fetch GitHub events ──► No events? ──► Skip (exit clean, no entry)
        │                              (no notification)
        ▼
   Has events? ──► Generate entry via OpenCode Go ──► Commit & push ──► Deploy
                        │
                        ▼
   On fetch error ──► Workflow fails ──► GitHub emails you ──► You fix it
```

### Files to Create/Modify

**1. Modify `scripts/fetch-github-day.mjs`** (small change)
- On fetch API error: `process.exit(1)` instead of silent `return` — so the workflow step fails and GitHub sends you a notification
- On zero events: exit 0 (no notification needed) — this stays as-is
- On success with events: writes JSON — stays as-is

**2. Create `scripts/generate-builder-log.mjs`** (new)
- Reads the latest `.tmp/builder-log-input-*.json` file
- Extracts summary stats, event types, repos, commit messages, PRs, issues
- Builds a prompt with all the data and asks OpenCode Go (`deepseek-v4-flash`) to generate the H.A.R.L. frontmatter
- Writes the markdown file to `src/user/content/builder-log/YYYY-MM-DD.md`

**3. Create `.github/workflows/generate-builder-log.yml`** (new)
```yaml
name: Generate Daily Builder Log

on:
  schedule:
    - cron: '0 20 * * *'  # 20:00 UTC = 23:00 Africa/Nairobi
  workflow_dispatch:       # Manual trigger for testing

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22.12.0
          cache: npm
      - run: npm ci
      
      - name: Fetch GitHub activity
        run: node scripts/fetch-github-day.mjs --username kaka-ruto --timezone Africa/Nairobi
        env:
          GITHUB_TOKEN: ${{ secrets.BUILDER_GITHUB_TOKEN }}
      
      - name: Generate builder log entry
        run: node scripts/generate-builder-log.mjs
        env:
          OPENCODE_GO_API_KEY: ${{ secrets.OPENCODE_GO_API_KEY }}
      
      - name: Commit and push
        run: |
          git config user.name "Kaka Ruto Bot"
          git config user.email "bot@kakaruto.com"
          git add src/user/content/builder-log/
          git diff --staged --quiet || (git commit -m "Add builder log entry for $(date +%Y-%m-%d)" && git push)
```

### How Errors Get Notified

| Scenario | Fetch exit code | Workflow result | You get notified? |
|---|---|---|---|
| API error (DNS, token expired) | 1 | ❌ Failed | ✅ GitHub emails you |
| No events (no work done) | 0 | ✅ Succeeded | ❌ No (correct) |
| Events found, entry generated | 0 | ✅ Succeeded | ❌ No (correct) |
| Generation fails (OpenCode down) | — | ❌ Failed | ✅ GitHub emails you |

GitHub sends email notifications for failed scheduled workflow runs by default.

### What You Need to Do (secrets to add in GitHub)

1. **`BUILDER_GITHUB_TOKEN`** — A GitHub personal access token with `repo` scope (to fetch your events). You likely already have one — the one in `.dev.vars` could work.
2. **`OPENCODE_GO_API_KEY`** — Your OpenCode Go API key from opencode.ai.

I'll walk you through adding these after the plan is approved.

### What I'll Build

1. The prompt template for the generation script — I'll design it to produce entries that match your existing style (natural, narrative H.A.R.L. format)
2. The generation script itself — handles API calls, parsing, and file writing
3. The GitHub Actions workflow
4. The fix to the fetch script for error exit codes