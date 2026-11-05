import type { JSONContent } from "@tiptap/react";
import { Prose } from "@/components/ui/prose";
import { cn } from "@/lib/utils/cn";
import styles from "./article-body.module.css";
import { TiptapContent } from "./tiptap-content";

/**
 * The article body: the Tiptap document rendered on the server into the
 * shared Prose, restyled for the rebuild (creative brief 4.5) by
 * article-body.module.css.
 */
export function ArticleBody({
  doc,
  className,
}: {
  doc: JSONContent;
  className?: string;
}) {
  return (
    <Prose size="lg" className={cn(styles.body, className)}>
      <TiptapContent doc={doc} />
    </Prose>
  );
}
