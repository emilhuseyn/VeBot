import { useI18n } from "@/i18n";

/** Three bouncing dots shown while a reply is being fetched. */
export function TypingIndicator() {
  const { t } = useI18n();
  return (
    <div
      role="status"
      aria-label={t("chat.loading")}
      className="flex h-6 items-center gap-1"
    >
      <span className="sr-only">{t("chat.loading")}</span>
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-text-muted animate-typing-dot"
        style={{ animationDelay: "0ms" }}
      />
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-text-muted animate-typing-dot"
        style={{ animationDelay: "150ms" }}
      />
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-text-muted animate-typing-dot"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}
