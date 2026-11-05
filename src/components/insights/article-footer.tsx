import { Tag } from "@/components/ui/tag";
import type { Article } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils/cn";
import { ShareLinks } from "./share-links";

/** Tags and the share row, under the body on the body's left edge. */
export function ArticleFooter({
  post,
  url,
  className,
}: {
  post: Article;
  url: string;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "border-line max-w-text flex flex-col gap-5 border-t pt-6",
        className,
      )}
    >
      {post.tags.length ? (
        <ul aria-label="Tags" className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Tag variant="outline">{tag.replace(/-/g, " ")}</Tag>
            </li>
          ))}
        </ul>
      ) : null}
      <ShareLinks url={url} title={post.title} />
    </footer>
  );
}
