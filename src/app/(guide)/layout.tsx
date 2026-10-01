import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/ui/motion-provider";

/** The style guide is an internal reference: never indexed. */
export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

/**
 * The guide's motion demos use framer-motion; the provider lives here so
 * the library never ships with the public site.
 */
export default function GuideLayout({ children }: { children: ReactNode }) {
  return <MotionProvider>{children}</MotionProvider>;
}
