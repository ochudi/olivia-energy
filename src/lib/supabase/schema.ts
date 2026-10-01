/**
 * Where this site's data lives inside the Supabase project. Everything is
 * namespaced so the project can be shared with other applications: the
 * tables, views and functions sit in their own Postgres schema, and uploads
 * in their own storage bucket. Both names are fixed by the migration in
 * supabase/migrations; change them there and here together.
 *
 * The schema must be listed under the project's exposed schemas (Project
 * Settings → Data API), or every query fails with PGRST106.
 */
export const DB_SCHEMA = "olivia_energy";

/** Public-read storage bucket for covers and inline images. */
export const MEDIA_BUCKET = "olivia-energy-media";
