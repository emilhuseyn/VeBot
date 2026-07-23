import type { ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps {
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Skip rendering entirely (e.g. on touch where hover doesn't exist). */
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

/** Small, inverted, calm tooltip. Wrap any focusable trigger. */
export function Tooltip({
  content,
  side = "top",
  align = "center",
  disabled = false,
  children,
  className,
}: TooltipProps) {
  if (disabled) return <>{children}</>;
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            "z-50 max-w-72 select-none rounded-md bg-text px-2.5 py-1.5 text-xs font-medium text-bg shadow-md",
            "motion-safe:animate-fade-in",
            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
