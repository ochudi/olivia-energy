import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/urls";
import { getPublishedPosts } from "@/lib/supabase/queries";
import { POST_CATEGORIES, type PostCategory } from "@/lib/supabase/types";

/**
 * `updated` is the day the page's copy last changed. Keep it honest: a
 * search engine that sees every page "modified" on every deploy stops
 * trusting the dates. Change it when you change the page.
 */
const STATIC_ROUTES: {
  path: string;
  updated: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", updated: "2026-10-01", changeFrequency: "monthly", priority: 1 },
  {
    path: "/what-we-do",
    updated: "2026-10-01",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/about",
    updated: "2026-10-01",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/insights",
    updated: "2026-10-01",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/publications",
    updated: "2026-09-29",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/contact",
    updated: "2026-09-29",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  {
    path: "/privacy",
    updated: "2026-09-29",
    changeFrequency: "yearly",
    priority: 0.2,
  },
];

/** Static pages plus every published article; refreshed with the posts tag. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const newest = posts[0]?.updated_at;

  const latestByCategory = new Map<PostCategory, string>();
  for (const post of posts) {
    const current = latestByCategory.get(post.category);
    if (!current || post.updated_at > current)
      latestByCategory.set(post.category, post.updated_at);
  }

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: new Date(
        route.path === "/insights" && newest ? newest : route.updated,
      ),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    // Only categories with something in them; an empty one is noindex.
    ...POST_CATEGORIES.filter((category) => latestByCategory.has(category)).map(
      (category) => ({
        url: absoluteUrl(`/insights/category/${category}`),
        lastModified: new Date(latestByCategory.get(category)!),
        changeFrequency: "weekly" as const,
        priority: 0.4,
      }),
    ),
    ...posts.map((post) => ({
      url: absoluteUrl(`/insights/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
