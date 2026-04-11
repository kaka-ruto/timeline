import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const builderLog = defineCollection({
  loader: glob({ base: "./src/content/builder-log", pattern: "**/*.md" }),
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

export const collections = { "builder-log": builderLog };
