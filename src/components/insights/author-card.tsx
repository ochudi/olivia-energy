import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FOUNDER } from "@/content/about";
import { INSIGHTS_PAGE } from "@/content/insights";
import { cn } from "@/lib/utils/cn";

/**
 * The author card after an article (creative brief 4.5): a deep-field
 * panel with square corners (an instrument, DESIGN.md Shapes), the
 * founder's portrait at 72 px, one sentence and "About our founder".
 */
export function AuthorCard({ className }: { className?: string }) {
  const copy = INSIGHTS_PAGE.article;
  const portrait = FOUNDER.portrait;
  return (
    <aside
      data-surface="paper-deep"
      aria-label={FOUNDER.name}
      className={cn(
        "bg-canvas text-ink flex flex-col gap-6 rounded-xs p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8",
        className,
      )}
    >
      {portrait.src ? (
        <div className="bg-surface relative size-[72px] shrink-0 overflow-hidden rounded-xs">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="72px"
            quality={75}
            className="object-cover object-top"
          />
        </div>
      ) : null}
      <div className="flex flex-col items-start gap-5">
        <p className="font-display text-display-xs text-ink text-pretty">
          {copy.authorCard}
        </p>
        <Button href={copy.authorLink.href} variant="text">
          {copy.authorLink.label}
        </Button>
      </div>
    </aside>
  );
}
