import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Tag } from "@/components/ui/tag";
import type { Article } from "@/lib/supabase/queries";
import { ShareLinks } from "./share-links";

/** Tags, the share row and the way back, on the body's left edge. */
export function ArticleFooter({ post, url }: { post: Article; url: string }) {
  return (
    <footer>
      <Container size="narrow" className="pb-section-sm">
        <div className="border-line max-w-text flex flex-col gap-5 border-t pt-6">
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
        </div>
        <Button
          href="/insights"
          variant="ghost"
          icon={<ArrowLeft />}
          iconPosition="start"
          className="mt-10"
        >
          All insights
        </Button>
      </Container>
    </footer>
  );
}
