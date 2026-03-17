import * as React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.ComponentPropsWithoutRef<"div">;

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn(
          "animate-pulse rounded-md bg-muted-foreground/20 dark:bg-muted/40",
          className,
        )}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
