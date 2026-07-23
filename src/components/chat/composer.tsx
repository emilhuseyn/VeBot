import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings";
import { useI18n } from "@/i18n";

/** Max textarea height ≈ 8 rows before it scrolls internally. */
const MAX_TEXTAREA_HEIGHT = 200;

export function Composer({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const sendOnEnter = useSettingsStore((s) => s.sendOnEnter);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = value.trim().length > 0 && !disabled;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [value]);

  const submitIfAllowed = () => {
    if (!value.trim() || disabled) return;
    onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (sendOnEnter) {
      if (!event.shiftKey) {
        event.preventDefault();
        submitIfAllowed();
      }
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      submitIfAllowed();
    }
  };

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border bg-surface shadow-md",
        "bg-gradient-to-b from-bg to-surface",
        "transition-[border-color,box-shadow] duration-200",
        "focus-within:border-accent/50 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-accent/15",
      )}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("composer.placeholder")}
        aria-label={t("composer.placeholder")}
        className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-text placeholder:text-text-muted focus:outline-none"
      />
      <div className="flex items-center justify-end px-2.5 pb-2.5">
        <Tooltip content={t("composer.send")}>
          <Button
            type="button"
            variant="primary"
            size="icon"
            onClick={submitIfAllowed}
            disabled={!canSend}
            aria-label={t("composer.send")}
            className="rounded-full"
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
