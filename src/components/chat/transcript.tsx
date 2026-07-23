import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import type { ChatEntry } from "@/lib/types";
import { AssistantAvatar } from "@/components/ui/logo";
import { Tooltip } from "@/components/ui/tooltip";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { MenuBubble } from "@/components/chat/menu-bubble";
import { useChatStore } from "@/store/chat";
import { useCopyToClipboard } from "@/lib/hooks";
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
      className="flex flex-col gap-5 py-6"
    >
      {entries.map((entry, index) => {
        const prev = entries[index - 1];
        const firstOfBotGroup = entry.role === "bot" && prev?.role !== "bot";

        if (entry.role === "user") {
          return (
            <div
              key={entry.id}
              className="flex justify-end motion-safe:animate-rise-in"
            >
              <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-surface-2 px-4 py-2.5 text-text">
                {entry.text}
              </div>
            </div>
          );
        }

        return (
          <BotRow key={entry.id} showAvatar={firstOfBotGroup}>
            {entry.kind === "text" ? (
              <BotText text={entry.text} />
            ) : (
              <MenuBubble
                menu={entry.menu}
                interactive={entry.id === lastMenuId && !loading}
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
  children,
}: {
  showAvatar: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 motion-safe:animate-rise-in">
      <div className="w-7 shrink-0">{showAvatar ? <AssistantAvatar /> : null}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function BotText({ text }: { text: string }) {
  const { t } = useI18n();
  const { copied, copy } = useCopyToClipboard();
  return (
    <div className="group">
      <div
        className="whitespace-pre-wrap break-words leading-relaxed text-text"
        style={{ fontSize: "var(--chat-font-size)" }}
      >
        {text}
      </div>
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
    </div>
  );
}
