import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export interface SkeletonProps extends ComponentProps<"div"> {
  /** Pass false when a parent already provides an aria-busy region. */
  labelled?: boolean;
}

export function Skeleton({ className, labelled = true, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden={!labelled}
      role={labelled ? "status" : undefined}
      aria-label={labelled ? "Loading" : undefined}
      className={cn("ds-shimmer rounded-md", className)}
      {...props}
    />
  );
}
