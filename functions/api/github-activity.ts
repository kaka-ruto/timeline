type Env = {
  GITHUB_ACTIVITY_TOKEN?: string;
  GITHUB_TOKEN?: string;
  GITHUB_ACTIVITY_CACHE?: KVNamespace;
};

type GitHubEvent = {
  id: string;
  type: string;
  public?: boolean;
  created_at: string;
  repo?: {
    name?: string;
  };
  payload?: {
    commits?: Array<unknown>;
    action?: string;
    pull_request?: {
      html_url?: string;
    };
    issue?: {
      html_url?: string;
    };
  };
};

type ActivityItem = {
  id: string;
  type: string;
  visibility: "public";
  repo: string;
  createdAt: string;
  commitCount: number;
  action: string;
  url: string | null;
};

const MAX_LIMIT = 10;
const FETCH_LIMIT = 30;
const CACHE_TTL_SECONDS = 600;
const PRIVATE_LABEL = "Private repository";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60"
    }
  });

const normalizeLimit = (value: string | null) => {
  const parsed = Number.parseInt(value ?? "5", 10);
  if (Number.isNaN(parsed) || parsed < 1) return 5;
  return Math.min(parsed, MAX_LIMIT);
};

const eventUrl = (event: GitHubEvent): string | null => {
  if (event.type === "PullRequestEvent") return event.payload?.pull_request?.html_url ?? null;
  if (event.type === "IssuesEvent") return event.payload?.issue?.html_url ?? null;
  if (event.repo?.name) return `https://github.com/${event.repo.name}`;
  return null;
};

const toAction = (event: GitHubEvent): string => {
  if (event.type === "PushEvent") return "pushed commits";
  if (event.type === "PullRequestEvent") return event.payload?.action ?? "updated pull request";
  if (event.type === "IssuesEvent") return event.payload?.action ?? "updated issue";
  return event.type.replace("Event", "").toLowerCase();
};

const toItem = (event: GitHubEvent): ActivityItem => ({
  id: event.id,
  visibility: "public",
  type: event.type,
  repo: event.repo?.name ?? "Unknown repository",
  createdAt: event.created_at,
  commitCount: Array.isArray(event.payload?.commits) ? event.payload.commits.length : 0,
  action: toAction(event),
  url: eventUrl(event)
});

const redactedPrivateSummary = (events: GitHubEvent[]) => {
  const privateEvents = events.filter((event) => event.public === false);
  const countsByType: Record<string, number> = {};

  for (const event of privateEvents) {
    const key = event.type.replace("Event", "");
    countsByType[key] = (countsByType[key] ?? 0) + 1;
  }

  return {
    label: PRIVATE_LABEL,
    total: privateEvents.length,
    byType: countsByType
  };
};

const publicItems = (events: GitHubEvent[], limit: number): ActivityItem[] =>
  events
    .filter((event) => event.public !== false)
    .slice(0, limit)
    .map(toItem);

const fetchGitHubEvents = async (username: string, token?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kakaruto.com-portfolio"
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const endpoint = token
    ? `https://api.github.com/user/events?per_page=${FETCH_LIMIT}`
    : `https://api.github.com/users/${username}/events/public?per_page=${FETCH_LIMIT}`;

  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API unavailable: ${response.status}`);
  }

  const events = (await response.json()) as GitHubEvent[];
  return events;
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") ?? "").trim();
  const limit = normalizeLimit(url.searchParams.get("limit"));

  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return json({ error: "Invalid GitHub username." }, 400);
  }

  const token = env.GITHUB_ACTIVITY_TOKEN ?? env.GITHUB_TOKEN;
  const cache = env.GITHUB_ACTIVITY_CACHE;
  const cacheKey = `github-activity:${username}:v1`;

  try {
    if (cache) {
      const cached = await cache.get(cacheKey, "json");
      if (cached) {
        return json(cached);
      }
    }

    const events = await fetchGitHubEvents(username, token);
    const payload = {
      events: publicItems(events, limit),
      privateSummary: redactedPrivateSummary(events),
      cachedForSeconds: CACHE_TTL_SECONDS
    };

    if (cache) {
      await cache.put(cacheKey, JSON.stringify(payload), { expirationTtl: CACHE_TTL_SECONDS });
    }

    return json(payload);
  } catch {
    return json({ error: "Failed to fetch GitHub activity." }, 502);
  }
};
