import { useCallback, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ImageOff, Loader2, Maximize2, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);
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
      {/* A button (not a link) — clicking opens the in-app lightbox instead of
          navigating away to the raw image URL. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("chat.imageOpen")}
        className="relative block cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60"
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
      </button>
      {image.caption && (
        <figcaption className="border-t px-3 py-2 text-xs leading-relaxed text-text-muted">
          {image.caption}
        </figcaption>
      )}

      <Lightbox
        open={open}
        onOpenChange={setOpen}
        src={src}
        alt={image.alt}
        caption={image.caption}
      />
    </figure>
  );
}

/** Full-screen image viewer. Closes on backdrop click, the ✕ button, or Esc. */
function Lightbox({
  open,
  onOpenChange,
  src,
  alt,
  caption,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
  caption?: string;
}) {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);

  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth > 0) setReady(true);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm motion-safe:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none sm:p-10"
        >
          <Dialog.Title className="sr-only">
            {alt || t("chat.imageOpen")}
          </Dialog.Title>

          {!ready && (
            <Loader2
              className="pointer-events-none absolute h-7 w-7 animate-spin text-white/70"
              aria-hidden
            />
          )}

          {/* Clicking the image itself should NOT close the viewer. */}
          <figure
            className="m-0 flex max-h-full max-w-full flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              ref={imgRef}
              src={src}
              alt={alt ?? ""}
              onLoad={() => setReady(true)}
              className={cn(
                "max-h-[86vh] max-w-[95vw] rounded-lg object-contain shadow-2xl transition-opacity duration-200",
                ready ? "opacity-100 motion-safe:animate-rise-in" : "opacity-0",
              )}
            />
            {caption && (
              <figcaption className="mt-3 max-w-[95vw] text-center text-sm text-white/85">
                {caption}
              </figcaption>
            )}
          </figure>

          <Dialog.Close
            aria-label={t("common.close")}
            className="fixed right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-5 w-5" aria-hidden />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
