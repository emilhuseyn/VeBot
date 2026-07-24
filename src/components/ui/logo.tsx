import { useState } from "react";
import { cn } from "@/lib/utils";

/** Official BDU emblem, served from public/. Swap the file to change the logo. */
const LOGO_SRC = "/bdu-logo.png";

/**
 * BDU mark — renders the official emblem from `public/bdu-logo.png`. If that
 * asset is missing (or fails to load) it falls back to a clean geometric mark
 * so the UI never breaks.
 */
export function BduMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <GeometricMark className={className} size={size} />;
  // The emblem is dark linework on transparent, made for a light background —
  // so it's placed on a white disc, which keeps it crisp in BOTH themes
  // (it would otherwise vanish on the dark surface).
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/5",
        className,
      )}
    >
      <img
        src={LOGO_SRC}
        alt=""
        decoding="async"
        onError={() => setFailed(true)}
        className="h-[86%] w-[86%] object-contain"
      />
    </span>
  );
}

/** Fallback mark used until the official emblem asset is in place. */
function GeometricMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path
        d="M8 12.2c2.7-1.5 5.3-1.5 7.2 0v9.6c-1.9-1.5-4.5-1.5-7.2 0v-9.6Z"
        fill="var(--primary-fg)"
        opacity="0.95"
      />
      <path
        d="M24 12.2c-2.7-1.5-5.3-1.5-7.2 0v9.6c1.9-1.5 4.5-1.5 7.2 0v-9.6Z"
        fill="var(--primary-fg)"
        opacity="0.78"
      />
      <circle cx="16" cy="8.1" r="1.7" fill="var(--gold)" />
    </svg>
  );
}

/** Text wordmark; pairs with BduMark in the sidebar header. */
export function BduWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "select-none text-[0.9375rem] font-semibold tracking-tight text-text",
        className,
      )}
    >
      BDU <span className="text-primary">Abituriyent</span>
    </span>
  );
}

/** Round assistant avatar shown next to bot messages. */
export function AssistantAvatar({ className }: { className?: string }) {
  return <BduMark size={28} className={cn("shadow-sm", className)} />;
}
