import profile from "../user/data/profile.json";
import navItems from "../user/data/nav.json";
import githubConfig from "../user/data/github.json";
import builderLogConfig from "../user/data/builder-log.json";

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

export type Writing = {
  id: string;
  title: string;
  url: string;
  summary: string;
  date: string;
  tags: string[];
};

export type WorkExperience = {
  id: string;
  company: string;
  location: string;
  role: string;
  period: string;
  startDate: string;
  highlights: string[];
};

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

export { profile, navItems, githubConfig, builderLogConfig };

export const pageMeta = {
  homeTitle: `${profile.name} | Portfolio`,
  homeDescription: `Product engineer portfolio of ${profile.name}.`,
  titleFor: (label: string) => `${label} | ${profile.name}`
};

