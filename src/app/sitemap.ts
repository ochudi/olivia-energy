import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/urls";
import { getPublishedPosts } from "@/lib/supabase/queries";
import { POST_CATEGORIES, type PostCategory } from "@/lib/supabase/types";

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/what-we-do", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/insights", changeFrequency: "weekly", priority: 0.8 },
  { path: "/publications", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

/** Static pages plus every published article; refreshed with the posts tag. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const newest = posts[0]?.updated_at;
  const built = new Date();

  const latestByCategory = new Map<PostCategory, string>();
  for (const post of posts) {
    const current = latestByCategory.get(post.category);
    if (!current || post.updated_at > current)
      latestByCategory.set(post.category, post.updated_at);
  }

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified:
        route.path === "/insights" && newest ? new Date(newest) : built,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...POST_CATEGORIES.map((category) => {
      const latest = latestByCategory.get(category);
      return {
        url: absoluteUrl(`/insights/category/${category}`),
        lastModified: latest ? new Date(latest) : built,
        changeFrequency: "weekly" as const,
        priority: 0.4,
      };
    }),
    ...posts.map((post) => ({
      url: absoluteUrl(`/insights/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
