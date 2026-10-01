import type { JSONContent } from "@tiptap/react";
import { z } from "zod";
import { STATS } from "@/content/home";
import { CONTACT, SITE, SOCIALS } from "@/content/site";
import type { Database } from "./database.types";

/**
 * Typed aliases over the generated Database type, plus the runtime
 * companions the UI needs (category labels, the settings schema).
 */

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

export type Post = Tables<"posts">;
export type PostInsert = TablesInsert<"posts">;
export type PostUpdate = TablesUpdate<"posts">;
export type Publication = Tables<"publications">;
export type PublicationInsert = TablesInsert<"publications">;
export type Setting = Tables<"settings">;
export type ContactMessage = Tables<"contact_messages">;
export type ContactMessageInsert = TablesInsert<"contact_messages">;
export type Profile = Tables<"profiles">;

export type PostCategory = Enums<"post_category">;
export type PostStatus = Enums<"post_status">;

/** A post without its body: what lists and cards need. */
export type PostSummary = Omit<Post, "body">;

/** Tiptap document stored in posts.body. */
export type PostBody = JSONContent;

/** The stored body, typed for the editor / renderer. */
export function postBody(post: Pick<Post, "body">): PostBody {
  return post.body as PostBody;
}

export const PROFILE_ROLES = ["admin", "editor"] as const;
export type ProfileRole = (typeof PROFILE_ROLES)[number];

/**
 * Display labels for the seven Insights categories. The enum values live
 * in the migration; this record must name every one of them (the type
 * makes a missing label a compile error).
 */
export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  "market-analysis": "Market analysis",
  "policy-regulation": "Policy & regulation",
  "energy-transition": "Energy transition",
  "downstream-gas": "Downstream & gas",
  power: "Power",
  "finance-investment": "Finance & investment",
  "research-notes": "Research notes",
};

export const POST_CATEGORIES = Object.keys(
  POST_CATEGORY_LABELS,
) as PostCategory[];

export function postCategoryLabel(category: PostCategory): string {
  return POST_CATEGORY_LABELS[category];
}

/* ------------------------------------------------------------------ */
/* Settings. Stored as key → jsonb; validated on read so the site never   */
/* renders a malformed value. Defaults come from src/content, so a       */
/* missing key falls back to the same copy the static pages use.         */
/* ------------------------------------------------------------------ */

const socialsSchema = z.object({
  linkedin: z.url().optional(),
  instagram: z.url().optional(),
  x: z.url().optional(),
});

const addressSchema = z.object({
  country: z.string(),
  label: z.string().optional(),
  lines: z.array(z.string()).default([]),
});

const phoneSchema = z.object({
  label: z.string().optional(),
  number: z.string(),
});

const statSchema = z.object({
  key: z.string().optional(),
  value: z.number(),
  suffix: z.string().optional(),
  label: z.string(),
  description: z.string().optional(),
});

const defaultSocials = Object.fromEntries(
  SOCIALS.map((s) => [s.id, s.href]),
) as z.input<typeof socialsSchema>;

export const settingsSchema = z.object({
  tagline: z.string().default(SITE.tagline),
  /** Shown on Contact and in the footer; contact-form messages are delivered here. */
  contact_email: z.email().default(CONTACT.email),
  socials: socialsSchema.default(defaultSocials),
  addresses: z
    .array(addressSchema)
    .default(CONTACT.offices.map((country) => ({ country, lines: [] }))),
  phones: z.array(phoneSchema).default([]),
  /** Footer legal line for NIPEX; the footer hides it while empty. */
  nipex_wording: z.string().default(""),
  stats: z.array(statSchema).default(STATS.map((s) => ({ ...s }))),
  /** The homepage stats band renders only when an admin switches it on. */
  stats_visible: z.boolean().default(false),
  /** Founder's Google Scholar profile, linked from Publications; empty hides the link. */
  scholar_url: z.url().or(z.literal("")).default(""),
});

export type SiteSettings = z.output<typeof settingsSchema>;
export type SettingsKey = keyof SiteSettings;
export const SETTINGS_KEYS = Object.keys(settingsSchema.shape) as SettingsKey[];

/** Folds `settings` rows into a validated object, filling defaults. */
export function parseSettings(
  rows: readonly Pick<Setting, "key" | "value">[],
): SiteSettings {
  const raw: Record<string, unknown> = {};
  for (const row of rows) raw[row.key] = row.value;
  return settingsSchema.parse(raw);
}

export function isPostCategory(value: unknown): value is PostCategory {
  return (
    typeof value === "string" &&
    (POST_CATEGORIES as readonly string[]).includes(value)
  );
}
