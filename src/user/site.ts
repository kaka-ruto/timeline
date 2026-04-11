export type NavItem = {
  label: string;
  href: string;
};

export type FeedItem = {
  id: string;
  kind: "project" | "writing" | "milestone";
  title: string;
  summary: string;
  date: string;
  cta: string;
  href: string;
  tags: string[];
};

export const profile = {
  name: "Kaka Ruto",
  handle: "@kaka-ruto",
  role: "Applied AI Software Engineer",
  location: "Liverpool, England, UK",
  bio: "Applied AI software engineer building practical products from idea to production.",
  avatar: "/profile/me.jpg",
  resumeUrl: "/profile/KakaRutoResume.pdf",
  website: "https://kakaruto.com",
  github: "https://github.com/kaka-ruto",
  linkedin: "https://www.linkedin.com/in/kaka-ruto/",
  x: "https://x.com/kaka_ruto"
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/writing" },
  { label: "Contact", href: "/contact" }
];

export const nowStatus = {
  focus: "Building 4ditor, an AI-powered real estate media SaaS.",
  shipping: "Improving automated video creation and approval workflows.",
  availability: "Open to select consulting and product engineering collaborations."
};

export const githubConfig = {
  username: "kaka-ruto",
  eventsLimit: 30
};

export const builderLogConfig = {
  timeZone: "Africa/Nairobi"
};

export const feedItems: FeedItem[] = [
  {
    id: "4ditor",
    kind: "project",
    title: "Built 4ditor to automate real estate photo and video workflows",
    summary:
      "Created a full-stack Rails 8 SaaS that uses AI for property image edits, branded video creation, and review approvals.",
    date: "2025-03-01",
    cta: "View project",
    href: "https://4ditor.com",
    tags: ["Rails 8", "AI", "SaaS", "Stripe"]
  },
  {
    id: "autohaven",
    kind: "project",
    title: "Grew Autohaven community to 700 users and 500 posts",
    summary:
      "Built social features, AI assistants, newsletter tooling, and programmatic SEO pages for automotive audiences.",
    date: "2024-10-15",
    cta: "See product",
    href: "https://autohaven.io",
    tags: ["Community", "SEO", "AI", "Rails"]
  },
  {
    id: "smartpension",
    kind: "milestone",
    title: "Shipped investment features at SmartPension",
    summary:
      "Delivered holdings and valuation improvements, domain gem abstractions, and high-confidence workflows in regulated finance.",
    date: "2023-11-10",
    cta: "Read story",
    href: "/about",
    tags: ["Fintech", "Ruby", "Architecture"]
  },
  {
    id: "writing-1",
    kind: "writing",
    title: "How I approach product engineering in early-stage startups",
    summary:
      "A practical breakdown of shipping fast while protecting product quality and user trust.",
    date: "2026-03-01",
    cta: "Read note",
    href: "/writing",
    tags: ["Product", "Startups", "Engineering"]
  }
];

export type Writing = {
  id: string;
  title: string;
  url: string;
  summary: string;
  date: string;
  tags: string[];
};

export const writings: Writing[] = [
  {
    id: "product-engineering",
    title: "How I approach product engineering in early-stage startups",
    url: "/writing",
    summary: "A practical breakdown of shipping fast while protecting product quality and user trust.",
    date: "2026-03-01",
    tags: ["Product", "Startups", "Engineering"]
  }
];

export type WorkExperience = {
  id: string;
  company: string;
  location: string;
  role: string;
  period: string;
  startDate: string;
  highlights: string[];
};

export const workHistory: WorkExperience[] = [
  {
    id: "smartpension",
    company: "SmartPension",
    location: "London, UK",
    role: "Ruby Software Engineer",
    period: "May 2022 - Apr 2024",
    startDate: "2022-05-01",
    highlights: [
      "Joined an investments core team responsible for maintaining and developing new features for trading, holdings and valuations",
      "Abstracted our domain code into a gem used internally in many projects, reducing duplication and saving dev time by 30%",
      "Automated developer and QA workflows using scripts, shortening cycle time by 9%",
      "Optimized processes for member valuations and holdings tracking, ensuring accurate and real-time data",
      "Integrated APIs to facilitate seamless communication with UK payment processors and trading platforms",
      "Implemented cash holdings that allowed members to easily convert their investments into cash",
      "Implemented multiple data operations to correct historical data",
      "Shadowed our Tech Lead - overseeing our domain, leading internal and external code reviews"
    ]
  },
  {
    id: "bettyblocks",
    company: "BettyBlocks",
    location: "Alkmaar, Netherlands",
    role: "Elixir Engineer",
    period: "Oct 2021 - May 2022",
    startDate: "2021-10-01",
    highlights: [
      "Joined BettyBlocks to help maintain the API of the No Code platform",
      "Joined an Elixir backend team building a graphql api that serviced thousands of businesses and handled millions of requests monthly",
      "Contributed to an internal ubuntu framework for running the company's suites of microservices",
      "Implemented a custom api rate limiter to limit too many requests from individual IPs and prevent DDoS attacks",
      "Joined the company's devops guild as my team's representative"
    ]
  },
  {
    id: "zindi",
    company: "Zindi",
    location: "South Africa, Remote",
    role: "Senior Full Stack Engineer",
    period: "June 2021 - May 2022",
    startDate: "2021-06-01",
    highlights: [
      "Added end to end features to both the user-facing platform and the admin platform, using Ruby on Rails and React",
      "Proposed and led the development of a new jobs platform that became a new source of company revenue",
      "Translated design mockups into code using ReactJS and Redux",
      "Added and tested new RESTful API endpoints",
      "Reduced bug turn-around time from numerous days or weeks to a few hours or days",
      "Received error metrics from the data science team and integrated them to the platform for our competitions' scoring",
      "Added end to end rescoring logic to rescore our competitions",
      "Setup deployments to AWS ECS using Docker and Docker Compose"
    ]
  },
  {
    id: "ourgivingboard",
    company: "OurGivingBoard",
    location: "US Remote",
    role: "Team Lead",
    period: "Dec 2020 - June 2021",
    startDate: "2020-12-01",
    highlights: [
      "Architected the company's crowdfunding platform using Rails REST API, consumed by a React web app",
      "Setup CI/CD to various AWS services using Docker",
      "The API handled over 2000 signups on launch day and processed over $30,000 in transaction volume in week 1",
      "Led the engineering team of 3"
    ]
  },
  {
    id: "quirkycoders",
    company: "QuirkyCoders",
    location: "Charlotte, NC, Remote",
    role: "Backend Engineer",
    period: "May 2020 - Feb 2021",
    startDate: "2020-05-01",
    highlights: [
      "Added features to the recruiting and hiring platform using Rails RESTful API, consumed by a React web app"
    ]
  },
  {
    id: "sokoplace",
    company: "SokoPlace",
    location: "Nairobi, Kenya",
    role: "Lead Engineer",
    period: "Jan 2020 - Jan 2021",
    startDate: "2020-01-01",
    highlights: [
      "Architected the company's transport and logistics platform using a Rails GraphQL API",
      "Consumed by a Vue web app and an Android app",
      "Setup deployments to AWS ECS using Docker and Docker Compose",
      "Led the engineering team of 5"
    ]
  },
  {
    id: "andela",
    company: "Andela",
    location: "Nairobi, Kenya",
    role: "Software Engineer",
    period: "August 2017 - March 2020",
    startDate: "2017-08-01",
    highlights: [
      "Worked on an internal product and with two of Andela's clients - Gobble(US) and Boatflex(Denmark)"
    ]
  }
];

export type Project = {
  id: string;
  name: string;
  url: string;
  description: string;
  period: string;
  startDate: string;
  highlights: string[];
  tags: string[];
};

export const projects: Project[] = [
  {
    id: "4ditor",
    name: "4ditor",
    url: "https://4ditor.com",
    description: "AI-powered real estate media SaaS",
    period: "Mar 2025 - Present",
    startDate: "2025-03-01",
    highlights: [
      "Full-stack Rails 8 SaaS platform automating photo editing and video content creation for real estate professionals",
      "Automated video generation engine transforming property images into dynamic video slideshows using AI",
      "Scheduling system for regular, automated video creation based on brand settings and video templates",
      "Multi-stage review and approval workflow for video elements ensuring user control",
      "Team accounts with multiple properties per account support",
      "Stripe integration for recurring and one-time payments",
      "Self-hosted on Hetzner VPS with Docker"
    ],
    tags: ["Rails 8", "AI", "SaaS", "Stripe"]
  },
  {
    id: "kawibot",
    name: "Kawibot",
    url: "https://kawibot.com",
    description: "AI for energy audits",
    period: "2025 - Present",
    startDate: "2025-01-01",
    highlights: [
      "AI-powered platform automating energy audits - data collection, engineering math, and report writing",
      "KawiLens: Field data collection with offline mode for basement walkthroughs, OCR for equipment nameplates",
      "Baseline: Bill ingestion engine with auto-extraction and regression baseline generation",
      "Workbench: Physics-based ECM selection and financial analysis (ROI, payback, NPV)",
      "Reporter: AI-generated technical reports in ASHRAE/ISO formats with chart embedding",
      "Team of 5 engineers building product across web, mobile, and AI integrations"
    ],
    tags: ["AI", "Energy", "SaaS", "Rails"]
  },
  {
    id: "anywaye",
    name: "Anywaye",
    url: "https://anywaye.com",
    description: "The ChatGPT for your product",
    period: "2026 - Present",
    startDate: "2026-01-01",
    highlights: [
      "Enterprise AI agent platform - build agents that connect to your APIs and talk to your software",
      "Studio: No-code agent builder with natural language configuration",
      "Brain: Intelligence layer parsing intent, orchestrating multi-API calls, dynamic computation",
      "Chat: Conversational UI with rich media, inline transactions, and channel deployment",
      "Patterns: Usage analytics with AI-powered feature recommendations",
      "Auto-routing across GPT-4, Claude, and Gemini models for optimal cost/quality"
    ],
    tags: ["AI Agents", "Enterprise", "SaaS", "Rails"]
  },
  {
    id: "autohaven",
    name: "Autohaven",
    url: "https://autohaven.io",
    description: "Online car community network",
    period: "2024 - 2025",
    startDate: "2024-04-01",
    highlights: [
      "Online car community with follow/unfollow, posts, comments and likes - grew to 700 users",
      "2 automotive AI assistants (General + Audi) answering car-related questions via conversation",
      "Newsletter system grown to 500 subscribers, sent over 2k emails",
      "Articles feature with 43 articles averaging 40 readers",
      "Complex data schema storing 100k+ car-related records from different car data APIs",
      "Programmatic SEO generating 100k+ web pages indexed by Google"
    ],
    tags: ["Community", "AI", "SEO", "Rails"]
  },
  {
    id: "cafaye",
    name: "Cafaye",
    url: "https://cafaye.com",
    description: "Agent-led publishing platform",
    period: "2026 - Present",
    startDate: "2026-01-01",
    highlights: [
      "Platform for building and publishing books with AI agents while keeping human accountability",
      "Agent registration and book publishing workflow",
      "Royalty tracking and payment automation",
      "Reader analytics and engagement metrics",
      "Integration with X/Twitter for author discovery"
    ],
    tags: ["Publishing", "AI Agents", "SaaS", "Rails"]
  },
  {
    id: "runbox",
    name: "Runbox",
    url: "https://github.com/kaka-ruto/runbox",
    description: "API for running code in containers",
    period: "2026 - Present",
    startDate: "2026-01-01",
    highlights: [
      "Fast, secure API for running code in isolated Docker containers",
      "Per-identifier persistent containers for instant repeat executions",
      "Multi-language support: Python, Ruby, Shell out of the box",
      "Configurable timeouts, memory limits, and network policies per request",
      "Automatic cleanup of idle containers",
      "Environment introspection - get OS, runtime, and package info before running code"
    ],
    tags: ["DevTools", "API", "Docker", "Python"]
  },
  {
    id: "solid_events",
    name: "SolidEvents",
    url: "https://github.com/kaka-ruto/solid_events",
    description: "Context Graph for Rails",
    period: "2026 - Present",
    startDate: "2026-01-01",
    highlights: [
      "Zero-config, database-backed observability engine for Rails 8+",
      "Auto-instrumentation: captures Controller actions, Active Jobs, and SQL queries",
      "Auto-linking: automatically links ActiveRecord creates/updates to traces",
      "Auto-labeling: maps controller actions to business terms",
      "Context scraping: automatically detects current_user, current_account",
      "Tail sampling: keeps all failures/slow traces, samples the rest",
      "Dashboard with live tail, trace waterfall, entity search, and incident lifecycle"
    ],
    tags: ["Observability", "Rails", "Gem", "Ruby"]
  },
  {
    id: "solid_agents",
    name: "SolidAgents",
    url: "https://github.com/kaka-ruto/solid_agents",
    description: "Event-driven error fixing workflow",
    period: "2026 - Present",
    startDate: "2026-01-01",
    highlights: [
      "Event-driven error fixing workflow for Rails apps, powered by RubyLLM agents",
      "Pipeline: error received -> staged agent workflow -> code fix attempt -> PR/CI tracking",
      "DB-backed run lifecycle and stage workflow with actor attribution",
      "Work-item board columns driven by stage transitions",
      "Handoff records between stage owners (alex, betty, chad, david, eddy)",
      "Built-in UI for runs, events, and artifacts"
    ],
    tags: ["AI Agents", "Rails", "Gem", "Ruby"]
  },
  {
    id: "cleo",
    name: "Cleo",
    url: "https://github.com/kaka-ruto/cleo",
    description: "Workflow CLI for shipping code",
    period: "2026 - Present",
    startDate: "2026-01-01",
    highlights: [
      "Workflow CLI that standardizes how humans and coding agents ship code, from PR to release",
      "pr: PR operations with safety checks, merge gating, check inspection",
      "qa: Full QA sessions from scaffold to final report with acceptance criteria",
      "task: Track and execute follow-up work identified by QA/review",
      "skill: Resolve, manage, install, validate, and customize agent skills",
      "release: Deterministic release lifecycle with changelog assembly",
      "cost: Engineering cost estimation using codebase metrics"
    ],
    tags: ["DevTools", "CLI", "Go", "Workflow"]
  },
  {
    id: "timeline",
    name: "Timeline",
    url: "https://github.com/kaka-ruto/timeline",
    description: "This portfolio website",
    period: "2026 - Present",
    startDate: "2026-01-01",
    highlights: [
      "Personal portfolio built with Astro + TailwindCSS",
      "Twitter-inspired layout: left rail, center timeline, right context panel",
      "Responsive design with mobile bottom nav",
      "Resume-driven content with profile media",
      "Dynamic right pane with Now status and GitHub activity",
      "Deployed on Cloudflare Pages at kakaruto.com"
    ],
    tags: ["Portfolio", "Astro", "Tailwind", "Cloudflare"]
  }
];

export const about = {
  intro:
    "I am a product engineer focused on building useful software from idea to production. I work across product discovery, backend architecture, and delivery workflows.",
  highlights: [
    "Built and launched multiple products with real user traction.",
    "Led teams and mentored engineers across startups and scaleups.",
    "Shipped across Rails, GraphQL, cloud infrastructure, and AI integrations.",
    "Background in biomedical engineering and full-stack product delivery."
  ]
};
