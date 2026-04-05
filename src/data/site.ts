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
  linkedin: "https://www.linkedin.com/in/kakaruto/",
  x: "https://x.com/kakaruto"
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/writing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

export const nowStatus = {
  focus: "Building 4ditor, an AI-powered real estate media SaaS.",
  shipping: "Improving automated video creation and approval workflows.",
  availability: "Open to select consulting and product engineering collaborations."
};

export const githubConfig = {
  username: "kaka-ruto",
  eventsLimit: 10
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
