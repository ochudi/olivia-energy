import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils/cn";

export function GuideSection({
  id,
  number,
  title,
  lede,
  children,
}: {
  id: string;
  number: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="border-line-strong pb-section-sm scroll-mt-28 border-t pt-8 md:pt-10"
    >
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4 lg:col-span-3">
          <Eyebrow number={number}>Section</Eyebrow>
        </div>
        <div className="md:col-span-8 lg:col-span-9">
          <h2
            id={`${id}-title`}
            className="font-display text-display-md text-ink tracking-tight"
          >
            {title}
          </h2>
          {lede ? (
            <p className="max-w-text text-ink-muted mt-4 text-lg leading-relaxed text-pretty">
              {lede}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-10 space-y-14 md:mt-14 md:space-y-20">{children}</div>
    </section>
  );
}

export function GuideSub({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-12 md:gap-8", className)}>
      <div className="md:col-span-4 lg:col-span-3">
        <h3 className="text-ink font-sans text-base font-semibold">{title}</h3>
        {description ? (
          <p className="text-ink-muted mt-2 text-sm leading-relaxed md:pr-6">
            {description}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 md:col-span-8 lg:col-span-9">{children}</div>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-text text-ink-muted mt-4 text-sm leading-relaxed">
      {children}
    </p>
  );
}
