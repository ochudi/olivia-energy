import { timingSafeEqual } from "node:crypto";
import {
  revalidatePosts,
  revalidatePublications,
  revalidateSettings,
} from "@/lib/supabase/revalidate";

/**
 * POST /api/revalidate — purge the public read cache after a write.
 *
 * Authorisation: `Authorization: Bearer <REVALIDATE_SECRET>`.
 *
 * Body, either shape:
 *  • a Supabase Database Webhook payload
 *      { type, table, record, old_record }   (posts / publications / settings)
 *  • an explicit request
 *      { table: "posts", slug?: string } | { table: "publications" } | { table: "settings" }
 *
 * Configure the webhook in Supabase → Database → Webhooks on insert, update
 * and delete of posts, publications and settings, pointing at this route
 * with the header above. Publishing from the admin then reaches the site
 * within the same second.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { error: "REVALIDATE_SECRET is not configured" },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization") ?? "";
  if (!bearerMatches(auth, secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const payload = (body ?? {}) as {
    table?: string;
    slug?: string;
    record?: { slug?: string } | null;
    old_record?: { slug?: string } | null;
  };

  const revalidated: string[] = [];
  switch (payload.table) {
    case "posts": {
      const slugs = new Set<string>();
      for (const s of [
        payload.slug,
        payload.record?.slug,
        payload.old_record?.slug,
      ]) {
        if (typeof s === "string" && s) slugs.add(s);
      }
      if (slugs.size === 0) revalidatePosts();
      for (const s of slugs) revalidatePosts(s);
      revalidated.push("posts", ...[...slugs].map((s) => `post:${s}`));
      break;
    }
    case "publications":
      revalidatePublications();
      revalidated.push("publications");
      break;
    case "settings":
      revalidateSettings();
      revalidated.push("settings");
      break;
    default:
      return Response.json(
        { error: "table must be posts, publications or settings" },
        { status: 400 },
      );
  }
  return Response.json({ revalidated, at: new Date().toISOString() });
}

/** Compares the Authorization header with the secret in constant time. */
function bearerMatches(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
