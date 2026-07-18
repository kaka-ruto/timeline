import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TMP_DIR = path.join(ROOT, ".tmp");
const OUT_DIR = path.join(ROOT, "src", "user", "content", "builder-log");

const OPENCODE_API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const MODEL = "deepseek-v4-flash";
const MAX_BODY_CHARS = 2000;

const findInputFile = () => {
  const files = fs
    .readdirSync(TMP_DIR)
    .filter((f) => f.startsWith("builder-log-input-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("No builder-log input files found in .tmp/ — nothing to generate.");
    process.exit(0);
  }

  return path.join(TMP_DIR, files[0]);
};

const summarizeEvents = (events, enriched) => {
  const lines = [];
  const grouped = {};

  for (const event of events) {
    const repo = String(event?.repo?.name ?? "unknown");
    const type = String(event?.type ?? "UnknownEvent");
    const ref = event?.payload?.ref ?? "";
    const branch = ref.replace("refs/heads/", "").replace("refs/tags/", "");

    if (!grouped[repo]) grouped[repo] = [];
    grouped[repo].push({ type, branch, id: String(event?.id ?? "") });
  }

  for (const [repo, evts] of Object.entries(grouped)) {
    lines.push(`\n### ${repo}`);
    for (const evt of evts) {
      let detail = `- ${evt.type}`;
      if (evt.branch) detail += ` (${evt.branch})`;

      // Add enriched context
      const enrichedEvent = enriched?.[evt.id];
      if (enrichedEvent) {
        if (enrichedEvent.kind === "compare" && enrichedEvent.commits?.length > 0) {
          detail += ` — commits:`;
          for (const c of enrichedEvent.commits) {
            detail += `\n  - ${c.message.slice(0, 120)}`;
          }
        }
        if (enrichedEvent.kind === "pull_request") {
          detail += ` — PR: ${enrichedEvent.title} (${enrichedEvent.html_url})`;
          if (enrichedEvent.merged) detail += " [merged]";
        }
        if (enrichedEvent.kind === "issue") {
          detail += ` — Issue: ${enrichedEvent.title} (${enrichedEvent.html_url})`;
        }
        if (enrichedEvent.kind === "issue_comment") {
          detail += ` — Comment on: ${enrichedEvent.issueTitle}`;
        }
        if (enrichedEvent.kind === "release") {
          detail += ` — Release: ${enrichedEvent.name} (${enrichedEvent.tag_name})`;
        }
      }

      lines.push(detail);
    }
  }

  return lines.join("\n");
};

const buildPrompt = (data) => {
  const { summary, events, enrichedByEventId } = data;
  const eventSummary = summarizeEvents(events || [], enrichedByEventId || {});

  const repos = Object.keys(summary?.countsByRepo || {}).join(", ");

  return `You are a product engineer writing a daily builder log entry. Write in first person, in a reflective and direct style — like a skilled engineer documenting their day for future self and peers.

Today's GitHub activity summary:
- Total contributions: ${summary?.publicCount + summary?.privateCount || 0} (${summary?.publicCount || 0} public, ${summary?.privateCount || 0} private)
- Event types: ${JSON.stringify(summary?.countsByType || {})}
- Repositories: ${repos || "none"}

Detailed event log:${eventSummary || "\n  (no detailed events available)"}

Now write a builder log entry with these EXACT frontmatter fields (YAML between --- markers). All string values must be wrapped in double quotes:

---
date: ${data.date}
contributionsTotal: ${summary?.publicCount + summary?.privateCount || 0}
contributionsPublic: ${summary?.publicCount || 0}
contributionsPrivate: ${summary?.privateCount || 0}
hook: "A single compelling sentence that captures the day's main theme. Not a list — a hook. Max 200 characters."
action: "A detailed description of what was done — specific, technical, mentions repos and changes. 2-4 sentences. Must be complete."
result: "What came of the work — shipped, deleted dead code, unblocked something, improved architecture. 1-2 sentences. Must be complete."
lesson: "One specific insight or principle learned from today's work. Not generic — tied to what actually happened. 2-3 complete sentences. Must end with a period."
links: []
images: []
---

After the closing ---, write 1-2 short paragraphs expanding on the work in a natural, diary-like tone. No markdown headings — just plain text paragraphs.

Important rules:
- hook must be ONE sentence, max 200 chars, wrapped in double quotes — it's a hook not a summary
- action must be detailed and specific — mention repos, patterns, architectural changes
- result must describe the concrete outcome — shipped, fixed, deleted, consolidated
- lesson must contain COMPLETE sentences ending with a period — at least 2 sentences, not cut off
- Wrap ALL hook, action, result, and lesson values in double quotes
- Do NOT wrap the YAML in any code blocks or backticks — just raw --- delimiters
- Do NOT include any explanatory text before or after the entry`;
};

const callLLM = async (prompt, apiKey) => {
  const response = await fetch(OPENCODE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a technical writer generating structured builder log entries in YAML frontmatter format. Output only the requested format — no greetings, no explanations."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenCode Go API error (${response.status}): ${body.slice(0, 300)}`);
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenCode Go API");
  }

  return content;
};

const writeEntry = (date, content) => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${date}.md`);

  // Guard against overwriting an existing entry
  if (fs.existsSync(outPath)) {
    const existing = fs.readFileSync(outPath, "utf8").trim();
    if (existing.length > 0) {
      console.error(`Entry already exists for ${date} — skipping (delete manually to regenerate)`);
      return outPath;
    }
  }

  // Validate that the response has frontmatter delimiters
  if (!content.includes("---")) {
    console.error("Generated content missing YAML frontmatter delimiters — writing raw content anyway");
  }

  // Clean the content: ensure it starts and ends with proper frontmatter
  let clean = content.trim();

  // If it doesn't start with ---, add it
  if (!clean.startsWith("---")) {
    clean = `---\n${clean}`;
  }
  // If it doesn't end with --- with content after, ensure proper closure
  if (!clean.endsWith("---")) {
    // Check if there's a closing --- somewhere
    const parts = clean.split("\n---");
    if (parts.length >= 2) {
      // Already has closing ---, keep as-is
    } else {
      // Remove opening --- wrapper if we're going to reformat
      clean = clean.replace(/^---\n/, "");
      clean = `---\n${clean}\n---\n`;
    }
  }

  fs.writeFileSync(outPath, clean + "\n", "utf8");
  console.log(outPath);
  return outPath;
};

const main = async () => {
  const apiKey = process.env.OPENCODE_GO_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENCODE_GO_API_KEY environment variable");
    process.exit(1);
  }

  const inputPath = findInputFile();
  console.error(`Reading input: ${inputPath}`);

  const raw = fs.readFileSync(inputPath, "utf8");
  const data = JSON.parse(raw);

  if (!data.events || data.events.length === 0) {
    console.error("Input file has no events — nothing to generate");
    process.exit(0);
  }

  const prompt = buildPrompt(data);

  console.error(`Calling OpenCode Go (${MODEL})...`);
  const gptContent = await callLLM(prompt, apiKey);

  const outPath = writeEntry(data.date, gptContent);
  // writeEntry already logs the outcome
};

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
