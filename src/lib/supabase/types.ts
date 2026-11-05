import type { JSONContent } from "@tiptap/react";
import { z } from "zod";
import { STATS } from "@/content/home";
import { CONTACT, NIPEX_WORDING, SITE, SOCIALS } from "@/content/site";
import type { InsightFormat, PublicationKind } from "@/types/contracts";
import type { Database } from "./database.types";
import type { DB_SCHEMA } from "./schema";

/**
 * Typed aliases over the generated Database type, plus the runtime
 * companions the UI needs (category labels, the settings schema).
 */

type PublicSchema = Database[typeof DB_SCHEMA];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

/**
 * The columns added by supabase/migrations/20261003120000_commentary_and_formats
 * are optional on the read types: a database that has not run the migration
 * returns rows without them, and the read layer treats a missing `kind` as
 * "journal" and a missing `format` as none. Plain strings, as the database
 * stores them, so a raw row is assignable; the read layer only passes on a
 * `format` it knows (isPostFormat), and PublicationKind / PostFormat name
 * the allowed values.
 */
type PostRow = Tables<"posts">;
export type Post = Omit<PostRow, "format"> & {
  /** One of POST_FORMATS, or none. */
  format?: string | null;
};
export type PostInsert = TablesInsert<"posts">;
export type PostUpdate = TablesUpdate<"posts">;
type PublicationRow = Tables<"publications">;
export type Publication = Omit<
  PublicationRow,
  "kind" | "published_on" | "topics" | "pull_quote" | "syndication"
> &
  Partial<
    Pick<
      PublicationRow,
      "kind" | "published_on" | "topics" | "pull_quote" | "syndication"
    >
  >;
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
  /** Footer legal line for NIPEX; the footer hides it when an admin clears it. */
  nipex_wording: z.string().default(NIPEX_WORDING),
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

/**
 * The Insights formats, in the order the Insights page lists them. The
 * values are the check constraint on posts.format in the migration; this
 * record must name every one of them (the type makes a missing label a
 * compile error). Singular, for a chip on one article.
 */
export const POST_FORMAT_LABELS: Record<InsightFormat, string> = {
  "energy-transition-briefing": "Energy transition briefing",
  "downstream-market-outlook": "Downstream market outlook",
  "african-energy-outlook": "African Energy Outlook",
  "esg-insight": "ESG insight",
  "policy-brief": "Policy brief",
  "executive-commentary": "Executive commentary",
  "research-paper": "Research paper",
  "webinar-podcast": "Webinar or podcast",
};

export type PostFormat = InsightFormat;
export const POST_FORMATS = Object.keys(POST_FORMAT_LABELS) as PostFormat[];

export function isPostFormat(value: unknown): value is PostFormat {
  return (
    typeof value === "string" &&
    (POST_FORMATS as readonly string[]).includes(value)
  );
}

/** A post's format when it has a known one, else null. */
export function postFormatOf(post: Pick<Post, "format">): PostFormat | null {
  return isPostFormat(post.format) ? post.format : null;
}

/** Labels for publications.kind, for the admin's select. */
export const PUBLICATION_KIND_LABELS: Record<PublicationKind, string> = {
  journal: "Journal article",
  "op-ed": "Op-ed",
  mention: "Mention",
  report: "Report",
  talk: "Talk",
};

export const PUBLICATION_KINDS = Object.keys(
  PUBLICATION_KIND_LABELS,
) as PublicationKind[];

export function isPublicationKind(value: unknown): value is PublicationKind {
  return (
    typeof value === "string" &&
    (PUBLICATION_KINDS as readonly string[]).includes(value)
  );
}

export function isPostCategory(value: unknown): value is PostCategory {
  return (
    typeof value === "string" &&
    (POST_CATEGORIES as readonly string[]).includes(value)
  );
}
