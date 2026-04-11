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
  x: "https://x.com/kakaruto_ruto"
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
    description: "AI-powered real estate media SaaS platform",
    period: "Mar 2025 - Present",
    startDate: "2025-03-01",
    highlights: [
      "Full-stack Rails 8 SaaS platform automating photo editing and video content creation for real estate professionals",
      "Automated video generation engine that transforms property images into dynamic video slideshows, leveraging AI for textual content",
      "Scheduling system for regular, automated video creation (daily, weekly, monthly) based on brand settings and video templates",
      "Multi-stage review and approval workflow for video elements (text overlays, captions/hashtags) ensuring user control",
      "Team accounts with multiple properties per account support",
      "Stripe integration for recurring and one-time payments",
      "Self-hosted on Hetzner VPS with Docker"
    ],
    tags: ["Rails 8", "AI", "SaaS", "Stripe", "Hotwire"]
  },
  {
    id: "autohaven",
    name: "Autohaven",
    url: "https://autohaven.io",
    description: "Online car community network",
    period: "Apr 2024 - Mar 2025",
    startDate: "2024-04-01",
    highlights: [
      "Online car community with follow/unfollow, posts, comments and likes - grew to 700 users and 500 posts",
      "2 automotive AI assistants (General + Audi) answering car-related questions via messaging and conversation",
      "Internal newsletter subscription system grown to 500 subscribers, sent over 2k emails",
      "Articles feature with 43 articles averaging 40 readers",
      "Complex data schema storing 100k+ car-related records from different car data APIs",
      "Programmatic SEO generating 100k+ web pages indexed by Google",
      "Processed 500k+ background jobs with SolidQueue"
    ],
    tags: ["Community", "AI", "SEO", "Rails", "Hotwire"]
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
