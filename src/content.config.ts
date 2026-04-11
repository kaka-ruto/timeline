import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const builderLog = defineCollection({
  loader: glob({ base: "./src/user/content/builder-log", pattern: "**/*.md" }),
  schema: z.object({
    date: z.coerce.date(),
    contributionsTotal: z.number().int().min(0).optional(),
    contributionsPublic: z.number().int().min(0).optional(),
    contributionsPrivate: z.number().int().min(0).optional(),
    hook: z.string().min(1),
    action: z.string().min(1),
    result: z.string().min(1),
    lesson: z.string().min(1),
    links: z
      .array(
        z.object({
          label: z.string().min(1),
          url: z.string().url()
        })
      )
      .max(4)
      .default([]),
    proofUrl: z.string().url().optional(),
    images: z.array(z.string()).max(4).default([]),
    draft: z.boolean().default(false)
  })
});

const work = defineCollection({
  loader: glob({ base: "./src/user/data/work", pattern: "**/*.md" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    location: z.string(),
    period: z.string(),
    startDate: z.string()
  })
});

const projects = defineCollection({
  loader: glob({ base: "./src/user/data/projects", pattern: "**/*.md" }),
  schema: z.object({
    name: z.string(),
    url: z.string(),
    description: z.string(),
    period: z.string(),
    startDate: z.string(),
    tags: z.array(z.string()).default([])
  })
});

const writing = defineCollection({
  loader: glob({ base: "./src/user/data/writing", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    url: z.string(),
    summary: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([])
  })
});

export const collections = { "builder-log": builderLog, work, projects, writing };
