import { siteGraph } from "@/lib/seo/json-ld";
import { getSettings } from "@/lib/supabase/queries";
import { JsonLd } from "./json-ld";

/** Organization, WebSite and founder Person, on every public page. */
export async function SiteJsonLd() {
  const settings = await getSettings();
  return <JsonLd data={siteGraph(settings)} />;
}
