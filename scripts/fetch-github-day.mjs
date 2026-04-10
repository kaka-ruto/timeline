import fs from "node:fs";
import path from "node:path";

const usage = () => {
  // eslint-disable-next-line no-console
  console.error(
    "Usage: node scripts/fetch-github-day.mjs [--date YYYY-MM-DD | --hours N] [--username USERNAME] [--timezone TZ]"
  );
  process.exit(2);
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const value = args[i];
    if (value === "--date") {
      options.date = args[i + 1];
      i += 1;
      continue;
    }
    if (value === "--hours") {
      options.hours = args[i + 1];
      i += 1;
      continue;
    }
    if (value === "--username") {
      options.username = args[i + 1];
      i += 1;
      continue;
    }
    if (value === "--timezone") {
      options.timeZone = args[i + 1];
      i += 1;
      continue;
    }
    if (value === "-h" || value === "--help") usage();
    usage();
  }
  return options;
};

const formatLocalDate = (value, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
};

const isoAtStartOfDayUtc = (dateString, timeZone) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error(`Invalid --date ${JSON.stringify(dateString)} (expected YYYY-MM-DD).`);
  }

  // Compute offset by formatting the same instant in the target zone and reading its UTC-equivalent midnight.
  // We do this by creating a Date at UTC midnight, then shifting via Intl formatting.
  const [year, month, day] = dateString.split("-").map((part) => Number(part));
  const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(utcMidnight);

  const localYear = Number(parts.find((part) => part.type === "year")?.value ?? year);
  const localMonth = Number(parts.find((part) => part.type === "month")?.value ?? month);
  const localDay = Number(parts.find((part) => part.type === "day")?.value ?? day);
  const localHour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const localMinute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const localSecond = Number(parts.find((part) => part.type === "second")?.value ?? 0);

  // Local time for utcMidnight in the target zone, expressed as a Date.UTC of those local fields.
  // The delta between those two is the zone offset at that date.
  const asIfUtc = Date.UTC(localYear, localMonth - 1, localDay, localHour, localMinute, localSecond);
  const offsetMs = asIfUtc - utcMidnight.getTime();

  const startUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0) - offsetMs;
  return new Date(startUtcMs).toISOString();
};

const normalizeHours = (value) => {
  if (value === undefined || value === null) return null;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed < 1) return null;
  return Math.min(parsed, 72);
};

const tokenFromDevVars = (root) => {
  const filePath = path.join(root, ".dev.vars");
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith("GITHUB_TOKEN=")) continue;
    const value = line.slice("GITHUB_TOKEN=".length).trim();
    if (!value) return null;
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      return value.slice(1, -1).trim() || null;
    }
    return value;
  }
  return null;
};

const readSiteConfig = (root) => {
  const filePath = path.join(root, "src", "data", "site.ts");
  const contents = fs.readFileSync(filePath, "utf8");

  const usernameMatch = contents.match(/githubConfig\s*=\s*\{[\s\S]*?username:\s*"([^"]+)"/m);
  const timeZoneMatch = contents.match(/builderLogConfig\s*=\s*\{[\s\S]*?timeZone:\s*"([^"]+)"/m);

  return {
    username: usernameMatch?.[1] ?? null,
    timeZone: timeZoneMatch?.[1] ?? null
  };
};

const main = async () => {
  const root = process.cwd();
  const options = parseArgs();
  const siteConfig = readSiteConfig(root);
  const username = options.username ?? siteConfig.username;
  const timeZone = options.timeZone ?? siteConfig.timeZone;

  if (!username) throw new Error("Missing GitHub username. Pass --username or set src/data/site.ts githubConfig.username.");
  if (!timeZone) throw new Error("Missing time zone. Pass --timezone or set src/data/site.ts builderLogConfig.timeZone.");

  const hours = normalizeHours(options.hours);
  if (hours && options.date) throw new Error("Use either --date or --hours, not both.");

  const now = new Date();
  const date = options.date ?? formatLocalDate(now, timeZone);

  const sinceUtc = hours ? new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString() : isoAtStartOfDayUtc(date, timeZone);
  const untilUtc = hours
    ? new Date(now.getTime()).toISOString()
    : isoAtStartOfDayUtc(new Date(Date.parse(`${date}T00:00:00Z`) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10), timeZone);

  const token = tokenFromDevVars(root);
  if (!token) throw new Error("Missing GITHUB_TOKEN in .dev.vars.");

  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=100`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "kakaruto.com-builder-log"
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GitHub events fetch failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const events = await response.json();
  const startMs = Date.parse(sinceUtc);
  const endMs = Date.parse(untilUtc);

  const inWindow = Array.isArray(events)
    ? events.filter((event) => {
        const ts = Date.parse(String(event?.created_at ?? ""));
        return Number.isFinite(ts) && ts >= startMs && ts < endMs;
      })
    : [];

  const outDir = path.join(root, ".tmp");
  fs.mkdirSync(outDir, { recursive: true });
  const suffix = hours ? `${date}-last-${hours}h` : date;
  const outPath = path.join(outDir, `builder-log-input-${suffix}.json`);

  // Keep only one input file around for the automation: delete older builder-log inputs before writing the new one.
  for (const entry of fs.readdirSync(outDir)) {
    if (!entry.startsWith("builder-log-input-") || !entry.endsWith(".json")) continue;
    const candidate = path.join(outDir, entry);
    if (candidate === outPath) continue;
    try {
      fs.unlinkSync(candidate);
    } catch {
      // best effort
    }
  }

  const payload = {
    mode: hours ? "rolling" : "day",
    date,
    timeZone,
    username,
    fetchedAt: new Date().toISOString(),
    sinceUtc,
    untilUtc,
    totalFetched: Array.isArray(events) ? events.length : 0,
    windowCount: inWindow.length,
    summary: (() => {
      const countsByType = {};
      let publicCount = 0;
      let privateCount = 0;
      const repoCounts = {};

      for (const event of inWindow) {
        const type = String(event?.type ?? "UnknownEvent");
        countsByType[type] = (countsByType[type] ?? 0) + 1;

        const isPrivate = event?.public === false;
        if (isPrivate) privateCount += 1;
        else publicCount += 1;

        const repo = String(event?.repo?.name ?? "");
        if (repo) repoCounts[repo] = (repoCounts[repo] ?? 0) + 1;
      }

      return {
        publicCount,
        privateCount,
        countsByType,
        countsByRepo: repoCounts
      };
    })(),
    events: inWindow
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  // eslint-disable-next-line no-console
  console.log(outPath);
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error?.stack || String(error));
  process.exit(1);
});
