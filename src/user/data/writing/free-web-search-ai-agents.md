---
title: Free, private web search for your AI agent
url: /writing/free-web-search-ai-agents
summary: Give your AI agent the ability to search the web — no API keys, no monthly bills, no tracking. Just Docker and two Ruby gems.
date: '2026/07/18'
tags:
  - Ruby
  - AI
  - MCP
  - Agents
image: /writing/free-web-search-hero.png
---

Your AI agent needs the web. It can write code, read files, run tests. But ask it "what happened in AI this week?" and it stares back at you.

Search APIs exist. Google Custom Search, SerpAPI, Bing, Tavily. They work. But they cost money — $50 here, $75 there — and every query you send teaches someone else's model what your agent is doing.

I wanted something I could run myself. Something fast, free, and private.

Turns out, it takes one `docker run` and two Ruby gems.

## Run your own search engine

[SearXNG](https://docs.searxng.org/) is a metasearch engine. You give it a query, it asks DuckDuckGo, Wikipedia, and a bunch of other engines, then hands you back the results. Clean JSON. No ads, no tracking, no API key.

I run mine with Docker. Create a `docker-compose.yml`:

```yaml
services:
  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    ports:
      - "8888:8080"
    volumes:
      - ./searxng-data:/etc/searxng
    restart: unless-stopped
```

Or a one-liner if you prefer:

```sh
docker run -d --name searxng -p 8888:8080 searxng/searxng
```

You now have `http://localhost:8888` — a full search engine on your machine.

One thing to tweak: SearXNG's default config enables a rate limiter. For local use you want that off. Create `searxng-data/settings.yml`:

```yaml
server:
  secret_key: "pick_something_random"
  port: 8888
  limiter: false
  bind_address: "0.0.0.0"

search:
  safe_search: 0
  formats:
    - html
    - json

engines:
  - name: duckduckgo
    engine: duckduckgo
  - name: wikipedia
    engine: wikipedia
```

The `json` format is the important bit — that's how the Ruby tools talk to SearXNG.

## Wire it into Ruby

There are two paths, depending on how you build agents.

### You write Ruby agents with ask-rb

Install the tool:

```sh
gem install ask-web-search
```

Then call it from code:

```ruby
require "ask/web_search"

tool = Ask::Tools::WebSearch.new
result = tool.execute(query: "whats new in ruby 4.0")
puts result
```

Here's what actually comes back:

```
1. Ruby 4.0: A Look at What's New
   https://ruby-lang.org/en/news/2026/
   Ruby 4.0 introduces pattern matching improvements, a new type system,
   and faster garbage collection.

2. Ruby 4.0 - Wikipedia
   https://en.wikipedia.org/wiki/Ruby_4.0
   Ruby 4.0 is a major release of the Ruby programming language.
   Development began in 2024 and the first stable version was released
   on April 1, 2026...
```

If you're using ask-agent, drop it in as a tool:

```ruby
# Inline — quick scripts (still works)
session = Ask::Agent::Session.new(
  model: "gpt-4o",
  tools: [Ask::Tools::WebSearch]
)
session.run("What are people saying about the new Ruby 4.0 types?")
```

Or the recommended way — define an agent with `Ask::Agent::Definition`:

```ruby
# agents/research_bot/agent.rb
class ResearchBot < Ask::Agent::Definition
  model "gpt-4o"
  tools Ask::Tools::WebSearch
  instructions "You can search the web for current information."
end
```

```sh
askr run research_bot "Latest on Ruby 4.0 types?"
```

The `askr` CLI also lists, schedules, and scaffolds agents.

The agent treats `WebSearch` like any other tool. It sees the results, picks out the relevant parts, and answers. No API costs.

### You use ZCode, Claude Code, or Cursor

You don't write Ruby agents — you use an MCP client. Same SearXNG, different gateway.

```sh
gem install ask-web-search-mcp
```

This installs `ask-web-search-mcp` on your PATH. Test it:

```sh
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | ask-web-search-mcp
```

You should see `"name":"ask_web_search"` in the response.

Then add it to your editor. For ZCode, edit `~/.zcode/v2/config.json`:

```json
{
  "mcp": {
    "servers": {
      "ask-web-search-mcp": {
        "type": "stdio",
        "command": "ask-web-search-mcp"
      }
    }
  }
}
```

For Claude Code:

```sh
claude mcp add ask-web-search-mcp -- ask-web-search-mcp
```

Restart your editor. Your model now has an `ask_web_search` tool. It'll use it whenever it needs current info.

## How it all fits together

```
Your editor → ask-web-search-mcp → SearXNG (localhost:8888) → DuckDuckGo + Wikipedia + ...
```

Every piece runs on your machine. No API keys, no monthly bills, no tracking.

## The gotchas

- **SearXNG needs the JSON format enabled.** If your tool returns HTML instead of JSON, add `format: json` to `search.formats` in `settings.yml`.
- **The tool is called `ask_web_search`, not `web_search`.** Old docs use the old name. If your client says "tool not found", that's why.
- **SearXNG can be chatty on first startup.** It pulls engine configs. Give it a minute.

## Where to go from here

The [ask-web-search repo](https://github.com/ask-rb/ask-web-search) has the full Ruby API. The [ask-web-search-mcp repo](https://github.com/ask-rb/ask-web-search-mcp) covers the MCP server setup.

But really, the commands at the top of this post are all you need. Docker, gem install, config edit. Ten minutes and your agent can search the web — no API keys, no monthly bills, no tracking.
