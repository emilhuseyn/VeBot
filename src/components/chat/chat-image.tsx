import { useCallback, useState } from "react";
import { ImageOff, Maximize2 } from "lucide-react";
import type { ChatImage } from "@/lib/types";
import { resolveMediaUrl } from "@/services/faq-api";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

/** Renders the image(s) attached to a bot answer. */
export function ChatImageGrid({ images }: { images: ChatImage[] }) {
  if (images.length === 0) return null;
  return (
    <div className={cn("mt-2.5 grid gap-2", images.length > 1 && "sm:grid-cols-2")}>
      {images.map((image, index) => (
        <ChatImageCard key={`${image.url}-${index}`} image={image} />
      ))}
    </div>
  );
}

function ChatImageCard({ image }: { image: ChatImage }) {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const src = resolveMediaUrl(image.url);

  // Catch images that finished decoding before React bound onLoad (data URIs,
  // cached images) — otherwise the load event can be missed entirely.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  if (errored) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed bg-surface px-3 py-2.5 text-xs text-text-muted">
        <ImageOff className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{image.alt || t("chat.imageFailed")}</span>
      </div>
    );
  }

  return (
    <figure className="group relative m-0 w-fit max-w-full overflow-hidden rounded-xl border bg-surface-2 shadow-sm">
      {/* Skeleton sits BEHIND the image, so the image is never hidden waiting on
          a load event — it just reveals over the skeleton once painted. */}
      {!loaded && (
        <div
          aria-hidden
          className="absolute inset-0 min-h-40 bg-surface-2 motion-safe:animate-pulse"
        />
      )}
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("chat.imageOpen")}
        className="relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60"
      >
        <img
          ref={imgRef}
          src={src}
          alt={image.alt ?? ""}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="relative block max-h-[22rem] w-auto max-w-full object-contain"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 max-md:opacity-100"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </a>
      {image.caption && (
        <figcaption className="border-t px-3 py-2 text-xs leading-relaxed text-text-muted">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}
