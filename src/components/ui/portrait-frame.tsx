"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { RingMark } from "@/components/ui/ring";
import type { Portrait } from "@/content/images";
import { cn } from "@/lib/utils/cn";

export type PortraitFrameProps = {
  portrait: Portrait;
  /** The `sizes` of the rendered circle, as next/image takes it. */
  sizes: string;
  /** Sets the diameter (a width utility); the frame is square. */
  className?: string;
  /** Ring colour (a text-* utility); defaults to the surface's primary. */
  ringClassName?: string;
};

/**
 * The founder's portrait inside the ring of the mark: a circular crop with
 * the face centred, the ring as its frame. The photograph is shown as
 * supplied (no blend, no grade). The ring draws once, the first time the
 * frame is a third in view, and then stays still: no scroll-linked or
 * looping movement. Server HTML, no JavaScript, no IntersectionObserver and
 * reduced motion all show the finished ring; only a frame that starts below
 * the fold is armed (hidden) so the draw has something to play.
 */
export function PortraitFrame({
  portrait,
  sizes,
  className,
  ringClassName = "text-primary",
}: PortraitFrameProps) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { top } = el.getBoundingClientRect();
    if (top < window.innerHeight * 0.66) return; // already on screen: finished
    el.dataset.ring = "armed";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        el.dataset.ring = "drawn";
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      className={cn("portrait-frame relative aspect-square", className)}
    >
      <RingMark
        size={300}
        stroke={3}
        animate="once"
        fill
        className={cn("absolute inset-0", ringClassName)}
      />
      <div className="bg-paper absolute inset-[5%] overflow-hidden rounded-full">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          width={portrait.width}
          height={portrait.height}
          sizes={sizes}
          quality={75}
          className="size-full object-cover"
        />
      </div>
    </div>
  );
}
