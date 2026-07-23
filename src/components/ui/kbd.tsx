import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Keyboard shortcut chip for tooltips, menus and the palette. */
export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-0.5",
        "rounded border bg-surface px-1.5 font-sans text-[0.65rem] font-medium text-text-muted",
        className,
      )}
      {...props}
    />
  );
}
