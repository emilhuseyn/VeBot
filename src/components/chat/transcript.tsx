import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { ChatEntry, ChatImage } from "@/lib/types";
import { AssistantAvatar } from "@/components/ui/logo";
import { Tooltip } from "@/components/ui/tooltip";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { MenuBubble } from "@/components/chat/menu-bubble";
import { ChatImageGrid } from "@/components/chat/chat-image";
import { useChatStore } from "@/store/chat";
import { useCopyToClipboard } from "@/lib/hooks";
import { linkify } from "@/lib/linkify";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export function Transcript({ entries }: { entries: ChatEntry[] }) {
  const { t } = useI18n();
  const loading = useChatStore((s) => s.loading);
  const select = useChatStore((s) => s.select);
  const nav = useChatStore((s) => s.nav);

  // Only the last menu entry stays interactive; earlier ones are read-only.
  let lastMenuId: string | null = null;
  for (const entry of entries) {
    if (entry.role === "bot" && entry.kind === "menu") lastMenuId = entry.id;
  }

  return (
    <div
      role="log"
      aria-label={t("aria.chatLog")}
      aria-live="polite"
      aria-busy={loading}
      className="flex flex-col gap-4 py-4"
    >
      {entries.map((entry, index) => {
        const prev = entries[index - 1];
        const firstOfBotGroup = entry.role === "bot" && prev?.role !== "bot";

        if (entry.role === "user") {
          return (
            <div
              key={entry.id}
              data-entry-id={entry.id}
              className="flex justify-end motion-safe:animate-rise-in"
            >
              <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-surface-2 px-3.5 py-2 text-text">
                {entry.text}
              </div>
            </div>
          );
        }

        // A question list re-shown right AFTER an answer (its previous entry is
        // the answer text) is redundant — collapse it to just the Back / Home
        // controls instead of repeating every question.
        const navOnly =
          entry.kind === "menu" &&
          entry.menu.level === "sub" &&
          prev?.role === "bot" &&
          prev.kind === "text";

        return (
          <BotRow key={entry.id} entryId={entry.id} showAvatar={firstOfBotGroup}>
            {entry.kind === "text" ? (
              <BotText
                text={entry.text}
                images={entry.images}
                url={entry.url}
              />
            ) : (
              <MenuBubble
                menu={entry.menu}
                interactive={entry.id === lastMenuId && !loading}
                navOnly={navOnly}
                onSelect={select}
                onNav={nav}
              />
            )}
          </BotRow>
        );
      })}

      {loading && (
        <BotRow showAvatar={entries[entries.length - 1]?.role !== "bot"}>
          <TypingIndicator />
        </BotRow>
      )}
    </div>
  );
}

function BotRow({
  showAvatar,
  entryId,
  children,
}: {
  showAvatar: boolean;
  entryId?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-entry-id={entryId}
      className="flex gap-3 motion-safe:animate-rise-in"
    >
      <div className="w-7 shrink-0">{showAvatar ? <AssistantAvatar /> : null}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function BotText({
  text,
  images,
  url,
}: {
  text: string;
  images?: ChatImage[];
  url?: string;
}) {
  const { t } = useI18n();
  const { copied, copy } = useCopyToClipboard();
  // When the answer is nothing but a link, the address itself is noise — the
  // action is what matters, so offer a button and drop the bare URL.
  const isLinkOnly = Boolean(url) && text.trim() === url?.trim();
  const hasText = !isLinkOnly && text.trim().length > 0;
  return (
    <div className="group">
      {hasText && (
        <div
          // Body size stays at the reading default — this is a public FAQ and
          // shrinking the answers themselves would cost more than it saves.
          // Only the leading tightens (1.6 -> 1.5), which is still inside the
          // comfortable band for long Azerbaijani prose.
          className="whitespace-pre-wrap break-words leading-normal text-text"
          style={{ fontSize: "var(--chat-font-size)" }}
        >
          {linkify(text)}
        </div>
      )}
      {images && images.length > 0 && <ChatImageGrid images={images} />}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5",
            "text-sm font-medium text-primary transition-colors hover:bg-primary/15",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
            hasText && "mt-2.5",
          )}
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          {t("chat.openLink")}
        </a>
      )}
      {hasText && (
        <div className="mt-1 flex h-7 items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
        <Tooltip content={copied ? t("chat.copied") : t("chat.copy")}>
          <button
            type="button"
            onClick={() => void copy(text)}
            aria-label={copied ? t("chat.copied") : t("chat.copy")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 max-md:h-9 max-md:w-9"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn("grid place-items-center")}
                >
                  <Check className="h-4 w-4 text-success" aria-hidden />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid place-items-center"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </Tooltip>
        </div>
      )}
    </div>
  );
}
