type Env = {
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
    commits?: Array<{
      sha?: string;
      message?: string;
    }>;
    action?: string;
    before?: string;
    head?: string;
    ref?: string;
    ref_type?: string;
    pull_request?: {
      title?: string;
      body?: string;
      html_url?: string;
    };
    issue?: {
      title?: string;
      body?: string;
      html_url?: string;
    };
    comment?: {
      body?: string;
      html_url?: string;
    };
    review?: {
      body?: string;
      html_url?: string;
    };
    release?: {
      name?: string;
      tag_name?: string;
      html_url?: string;
      body?: string;
    };
  };
};

type CompareResponse = {
  total_commits?: number;
  commits?: Array<{
    sha?: string;
    commit?: {
      message?: string;
    };
  }>;
};

type ActivityItem = {
  id: string;
  type: string;
  visibility: "public" | "private";
  repo: string;
  createdAt: string;
  commitCount: number;
  action: string;
  url: string | null;
  commits: Array<{
    sha: string;
    message: string;
    url: string;
  }>;
  compareUrl: string | null;
  detail: string | null;
};

const MAX_LIMIT = 10;
const FETCH_LIMIT = 30;
const COMMIT_LOOKBACK_DAYS = 90;
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
  if (event.type === "ReleaseEvent") return event.payload?.release?.html_url ?? null;
  if (event.type === "PullRequestEvent") return event.payload?.pull_request?.html_url ?? null;
  if (event.type === "IssuesEvent") return event.payload?.issue?.html_url ?? null;
  if (event.type === "IssueCommentEvent") return event.payload?.comment?.html_url ?? event.payload?.issue?.html_url ?? null;
  if (event.type === "PullRequestReviewCommentEvent") {
    return event.payload?.comment?.html_url ?? event.payload?.pull_request?.html_url ?? null;
  }
  if (event.type === "PullRequestReviewEvent") {
    return event.payload?.review?.html_url ?? event.payload?.pull_request?.html_url ?? null;
  }
  if (event.repo?.name) return `https://github.com/${event.repo.name}`;
  return null;
};

const compareUrl = (event: GitHubEvent): string | null => {
  const repo = event.repo?.name;
  const before = event.payload?.before;
  const head = event.payload?.head;
  if (!repo || !before || !head) return null;
  return `https://github.com/${repo}/compare/${before}...${head}`;
};

const commitItems = (event: GitHubEvent) => {
  const repo = event.repo?.name;
  if (!repo || !Array.isArray(event.payload?.commits)) return [];
  return event.payload.commits.slice(0, 3).map((commit) => {
    const sha = String(commit.sha ?? "").slice(0, 7);
    const message = String(commit.message ?? "Commit").split("\n")[0];
    return {
      sha,
      message,
      url: `https://github.com/${repo}/commit/${commit.sha ?? ""}`
    };
  });
};

const compact = (value?: string) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const detailFor = (event: GitHubEvent): string | null => {
  if (event.type === "PullRequestEvent") {
    const title = compact(event.payload?.pull_request?.title);
    if (title) return title;
    return compact(event.payload?.pull_request?.body) || null;
  }

  if (event.type === "IssuesEvent") {
    const title = compact(event.payload?.issue?.title);
    if (title) return title;
    return compact(event.payload?.issue?.body) || null;
  }

  if (event.type === "IssueCommentEvent") {
    const body = compact(event.payload?.comment?.body);
    if (body) return body;
    return compact(event.payload?.issue?.title) || null;
  }

  if (event.type === "PullRequestReviewCommentEvent") {
    const body = compact(event.payload?.comment?.body);
    if (body) return body;
    return compact(event.payload?.pull_request?.title) || null;
  }

  if (event.type === "PullRequestReviewEvent") {
    const body = compact(event.payload?.review?.body);
    if (body) return body;
    return compact(event.payload?.pull_request?.title) || null;
  }

  if (event.type === "ReleaseEvent") {
    const releaseName = compact(event.payload?.release?.name);
    if (releaseName) return releaseName;
    const tag = compact(event.payload?.release?.tag_name);
    if (tag) return tag;
    return compact(event.payload?.release?.body) || null;
  }

  if (event.type === "CreateEvent") {
    const refType = compact(event.payload?.ref_type);
    const ref = compact(event.payload?.ref);
    if (refType && ref) return `${refType}: ${ref}`;
    return ref || null;
  }

  return null;
};

const isMeaningfulEvent = (event: GitHubEvent): boolean => {
  const allowed = new Set([
    "PushEvent",
    "PullRequestEvent",
    "IssuesEvent",
    "IssueCommentEvent",
    "PullRequestReviewCommentEvent",
    "PullRequestReviewEvent",
    "ReleaseEvent",
    "WatchEvent",
    "ForkEvent",
    "CreateEvent"
  ]);

  if (!allowed.has(event.type)) return false;
  if (event.type === "PullRequestReviewEvent") {
    return compact(event.payload?.review?.body).length > 0;
  }

  return true;
};

const toAction = (event: GitHubEvent): string => {
  if (event.type === "PushEvent") return "pushed commits";
  if (event.type === "PullRequestEvent") return event.payload?.action ?? "updated pull request";
  if (event.type === "IssuesEvent") return event.payload?.action ?? "updated issue";
  return event.type.replace("Event", "").toLowerCase();
};

const normalizeToken = (token?: string) => {
  const value = String(token ?? "").trim();
  if (!value) return undefined;
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1).trim() || undefined;
  }
  return value;
};

const buildHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kakaruto.com-portfolio"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const enrichPushEvents = async (events: GitHubEvent[], token?: string): Promise<GitHubEvent[]> => {
  const headers = buildHeaders(token);

  return Promise.all(
    events.map(async (event) => {
      if (event.type !== "PushEvent") return event;
      const existing = event.payload?.commits ?? [];
      if (existing.length > 0) return event;

      const repo = event.repo?.name;
      const before = event.payload?.before;
      const head = event.payload?.head;
      if (!repo || !before || !head) return event;

      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/compare/${before}...${head}`, {
          headers
        });
        if (!response.ok) return event;
        const compare = (await response.json()) as CompareResponse;
        const commits = (compare.commits ?? []).map((commit) => ({
          sha: commit.sha,
          message: commit.commit?.message ?? "Commit"
        }));

        return {
          ...event,
          payload: {
            ...event.payload,
            commits
          }
        };
      } catch {
        return event;
      }
    })
  );
};

const PRIVATE_REPO_NAME = "a private repo";

const toItem = (event: GitHubEvent): ActivityItem => {
  const isPrivate = event.public === false;

  return {
    id: event.id,
    visibility: isPrivate ? "private" : "public",
    type: event.type,
    repo: isPrivate ? PRIVATE_REPO_NAME : event.repo?.name ?? "Unknown repository",
    createdAt: event.created_at,
    commitCount: Array.isArray(event.payload?.commits) ? event.payload.commits.length : 0,
    action: toAction(event),
    url: isPrivate ? null : eventUrl(event),
    commits: isPrivate ? [] : commitItems(event),
    compareUrl: isPrivate ? null : compareUrl(event),
    detail: isPrivate ? "private" : detailFor(event)
  };
};

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

const feedItems = (events: GitHubEvent[], limit: number): ActivityItem[] =>
  events
    .filter(isMeaningfulEvent)
    .slice(0, limit)
    .map(toItem);

const fetchPublicEvents = async (username: string) => {
  const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=${FETCH_LIMIT}`, {
    headers: buildHeaders()
  });

  if (!response.ok) {
    throw new Error(`GitHub public events unavailable: ${response.status}`);
  }

  return (await response.json()) as GitHubEvent[];
};

const fetchGitHubEvents = async (username: string, token?: string) => {
  const normalizedToken = normalizeToken(token);

  if (!normalizedToken) {
    return fetchPublicEvents(username);
  }

  const headers = buildHeaders(normalizedToken);

  const response = await fetch(`https://api.github.com/user/events?per_page=${FETCH_LIMIT}`, { headers });
  if (!response.ok) {
    // Fine-grained token permissions or endpoint access may block private activity.
    // In that case, build a mixed public/private activity feed from accessible repo commits.
    return fetchRepoActivity(username, normalizedToken);
  }

  const events = (await response.json()) as GitHubEvent[];
  return events;
};

type Repo = {
  full_name: string;
  private?: boolean;
};

const fetchReposForActivity = async (token: string): Promise<Repo[]> => {
  const headers = buildHeaders(token);
  const repos: Repo[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `https://api.github.com/user/repos?sort=pushed&direction=desc&per_page=50&page=${page}&affiliation=owner,collaborator,organization_member`,
      { headers }
    );

    if (!response.ok) break;
    const batch = (await response.json()) as Repo[];
    repos.push(...batch);
    if (batch.length < 50) break;
  }

  return repos;
};

type IssueOrPullRequestSearchItem = {
  id: number;
  html_url?: string;
  title?: string;
  body?: string;
  created_at?: string;
  updated_at?: string;
  repository_url?: string;
  pull_request?: unknown;
  number?: number;
  comments_url?: string;
  user?: {
    login?: string;
  };
};

type SearchResponse = {
  items?: IssueOrPullRequestSearchItem[];
};

type RepoCommit = {
  sha?: string;
  commit?: {
    message?: string;
    author?: {
      date?: string;
    };
  };
};

const repoNameFromUrl = (value?: string) => {
  const url = String(value ?? "");
  const marker = "/repos/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const remainder = url.slice(index + marker.length);
  const parts = remainder.split("/");
  const owner = parts[0];
  const name = parts[1];
  if (!owner || !name) return null;
  return `${owner}/${name}`;
};

const fetchRepoActivity = async (username: string, token: string): Promise<GitHubEvent[]> => {
  const repos = await fetchReposForActivity(token);
  if (repos.length === 0) {
    return fetchPublicEvents(username);
  }
  const reposIndex = new Map(repos.map((repo) => [repo.full_name, repo.private === true]));

  const since = new Date(Date.now() - COMMIT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const commitsPromise = fetchRepoCommitEventsForRepos(username, token, repos.slice(0, 50), since);
  const prsPromise = fetchSearchEvents(username, token, "pr", reposIndex);
  const issuesPromise = fetchSearchEvents(username, token, "issue", reposIndex);

  const [commitEvents, prEvents, issueEvents] = await Promise.all([commitsPromise, prsPromise, issuesPromise]);
  return [...commitEvents, ...prEvents, ...issueEvents].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
};

const fetchRepoCommitEvents = async (username: string, token: string): Promise<GitHubEvent[]> => {
  const repos = (await fetchReposForActivity(token)).slice(0, 20);
  if (repos.length === 0) return fetchPublicEvents(username);
  const since = new Date(Date.now() - COMMIT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return fetchRepoCommitEventsForRepos(username, token, repos, since);
};

const fetchRepoCommitEventsForRepos = async (
  username: string,
  token: string,
  repos: Repo[],
  since: string
): Promise<GitHubEvent[]> => {
  const headers = buildHeaders(token);

  const results = await Promise.all(
    repos.map(async (repo) => {
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${repo.full_name}/commits?author=${encodeURIComponent(username)}&since=${encodeURIComponent(since)}&per_page=2`,
        { headers }
      );
      if (!commitsResponse.ok) return [];
      const commits = (await commitsResponse.json()) as RepoCommit[];

      return commits
        .filter((commit) => commit.sha && commit.commit?.author?.date)
        .map((commit) => ({
          id: `${repo.full_name}-${commit.sha}`,
          type: "PushEvent",
          public: repo.private ? false : true,
          created_at: commit.commit?.author?.date ?? new Date().toISOString(),
          repo: { name: repo.full_name },
          payload: {
            commits: [
              {
                sha: commit.sha,
                message: commit.commit?.message ?? "Commit"
              }
            ],
            action: "pushed"
          }
        }) as GitHubEvent);
    })
  );

  return results.flat().sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
};

const searchUrl = (query: string) =>
  `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=10`;

const maxIsoTime = (a?: string | null, b?: string | null) => {
  const aValue = a ? Date.parse(a) : Number.NaN;
  const bValue = b ? Date.parse(b) : Number.NaN;
  if (Number.isNaN(aValue)) return b ?? null;
  if (Number.isNaN(bValue)) return a ?? null;
  return aValue >= bValue ? a ?? null : b ?? null;
};

const latestIssueCommentAt = async (
  item: IssueOrPullRequestSearchItem,
  username: string,
  headers: Record<string, string>,
  since: string
) => {
  const commentsUrl = item.comments_url;
  if (!commentsUrl) return null;

  try {
    const response = await fetch(`${commentsUrl}?per_page=100&since=${encodeURIComponent(since)}`, { headers });
    if (!response.ok) return null;
    const comments = (await response.json()) as Array<{ user?: { login?: string }; created_at?: string }>;
    let latest: string | null = null;
    for (const comment of comments) {
      if (comment?.user?.login !== username) continue;
      latest = maxIsoTime(latest, comment.created_at ?? null);
    }
    return latest;
  } catch {
    return null;
  }
};

const contributionTimestampFor = async (
  item: IssueOrPullRequestSearchItem,
  username: string,
  headers: Record<string, string>,
  since: string
) => {
  // Use the latest *your* comment in the window if available; otherwise fall back to creation time
  // when you authored the item.
  const authoredAt = item.user?.login === username ? item.created_at ?? null : null;
  const commentedAt = await latestIssueCommentAt(item, username, headers, since);
  return maxIsoTime(authoredAt, commentedAt) ?? item.created_at ?? item.updated_at ?? new Date().toISOString();
};

const fetchSearchEvents = async (
  username: string,
  token: string,
  kind: "pr" | "issue",
  reposIndex: Map<string, boolean>
): Promise<GitHubEvent[]> => {
  const headers = buildHeaders(token);
  const queries =
    kind === "pr"
      ? [`author:${username} type:pr`, `commenter:${username} type:pr`]
      : [`author:${username} type:issue`, `commenter:${username} type:issue`];

  const responses = await Promise.all(queries.map((query) => fetch(searchUrl(query), { headers })));
  const payloads: SearchResponse[] = [];
  for (const response of responses) {
    if (!response.ok) continue;
    try {
      payloads.push((await response.json()) as SearchResponse);
    } catch {
      // ignore malformed payloads
    }
  }

  const rawItems = payloads.flatMap((payload) => payload.items ?? []);
  const uniqueItems = new Map<number, IssueOrPullRequestSearchItem>();
  for (const item of rawItems) {
    if (!item?.id || !item.html_url) continue;
    uniqueItems.set(item.id, item);
  }

  const since = new Date(Date.now() - COMMIT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const items = Array.from(uniqueItems.values());

  const timestamps = await Promise.all(
    items.map(async (item) => ({
      item,
      contributedAt: await contributionTimestampFor(item, username, headers, since)
    }))
  );

  return timestamps
    .filter(({ contributedAt }) => Boolean(contributedAt))
    .sort((a, b) => Date.parse(b.contributedAt) - Date.parse(a.contributedAt))
    .slice(0, 10)
    .map(({ item, contributedAt }) => {
      const repoName = repoNameFromUrl(item.repository_url) ?? "Unknown repository";
      const isPrivate = reposIndex.get(repoName) === true;
      const createdAt = contributedAt;

      if (kind === "pr") {
        return {
        id: `pr-${item.id}`,
        type: "PullRequestEvent",
        public: isPrivate ? false : true,
        created_at: createdAt,
        repo: { name: repoName },
        payload: {
          action: "updated",
          pull_request: {
            title: item.title,
            body: item.body,
            html_url: item.html_url
          }
        }
        } as GitHubEvent;
      }

      return {
      id: `issue-${item.id}`,
      type: "IssuesEvent",
      public: isPrivate ? false : true,
      created_at: createdAt,
      repo: { name: repoName },
      payload: {
        action: "updated",
        issue: {
          title: item.title,
          body: item.body,
          html_url: item.html_url
        }
      }
      } as GitHubEvent;
    });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") ?? "").trim();
  const limit = normalizeLimit(url.searchParams.get("limit"));

  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return json({ error: "Invalid GitHub username." }, 400);
  }

  const token = env.GITHUB_TOKEN;
  const cache = env.GITHUB_ACTIVITY_CACHE;
  const cacheKey = `github-activity:${username}:v5`;

  try {
    if (cache) {
      const cached = await cache.get(cacheKey, "json");
      if (cached) {
        return json(cached);
      }
    }

    const rawEvents = await fetchGitHubEvents(username, token);
    const events = await enrichPushEvents(rawEvents, token);
    const payload = {
      events: feedItems(events, limit),
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
