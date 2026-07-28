import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "iconSm";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary bg-gradient-to-b from-primary to-primary-hover text-primary-fg shadow-sm shadow-primary/25 hover:brightness-110",
  secondary: "bg-surface-2 text-text hover:bg-border/70",
  outline: "border border-border bg-bg text-text hover:bg-surface",
  ghost: "text-text-muted hover:bg-surface-2 hover:text-text",
  danger: "text-error hover:bg-error/10",
};

// Mobile sizes bottom out at h-11 (44px), the minimum comfortable touch target.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[0.8125rem] max-md:h-11",
  md: "h-9 px-3.5 text-sm max-md:h-11",
  lg: "h-10 px-4 text-sm max-md:h-11",
  icon: "h-9 w-9 max-md:h-11 max-md:w-11",
  iconSm: "h-8 w-8 max-md:h-11 max-md:w-11",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render the child element instead of a <button> (Radix Slot). */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", asChild = false, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium",
          "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "disabled:pointer-events-none disabled:opacity-50",
          "motion-safe:active:scale-[0.97]",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
