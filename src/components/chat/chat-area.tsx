import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Composer } from "@/components/chat/composer";
import { Transcript } from "@/components/chat/transcript";
import { ScrollToBottomButton } from "@/components/chat/scroll-to-bottom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "@/store/chat";
import { useI18n } from "@/i18n";

const PIN_THRESHOLD_PX = 80;

export function ChatArea() {
  const { t } = useI18n();
  const entries = useChatStore((s) => s.entries);
  const hydrated = useChatStore((s) => s.hydrated);
  const loading = useChatStore((s) => s.loading);
  const error = useChatStore((s) => s.error);
  const start = useChatStore((s) => s.start);
  const sendText = useChatStore((s) => s.sendText);
  const retry = useChatStore((s) => s.retry);

  const [draft, setDraft] = useState("");
  const [pinned, setPinned] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);

  // Send the greeting turn once history has rehydrated and is empty.
  useEffect(() => {
    if (hydrated && entries.length === 0) start();
  }, [hydrated, entries.length, start]);

  const handleSubmit = useCallback(() => {
    const text = draft.trim();
    if (!text || loading) return;
    sendText(text);
    setDraft("");
    pinnedRef.current = true;
    setPinned(true);
  }, [draft, loading, sendText]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior,
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distance < PIN_THRESHOLD_PX;
    pinnedRef.current = atBottom;
    setPinned((current) => (current === atBottom ? current : atBottom));
  }, []);

  const entryCount = entries.length;
  const lastText =
    entries[entries.length - 1]?.role === "user"
      ? "user"
      : entries[entries.length - 1]?.id ?? "";

  // Keep pinned to newest content as the transcript grows.
  useLayoutEffect(() => {
    if (!pinnedRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entryCount, lastText, loading]);

  if (!hydrated) {
    return (
      <div className="mx-auto flex w-full max-w-[var(--chat-max-width)] flex-1 flex-col gap-4 px-4 py-10">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-[var(--chat-max-width)] px-4">
          <Transcript entries={entries} />
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center pb-3">
          <div className="pointer-events-auto">
            <ScrollToBottomButton
              visible={!pinned}
              onClick={() => scrollToBottom("smooth")}
            />
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-bg to-transparent"
        />
        <div className="bg-bg/85 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
          <div className="mx-auto w-full max-w-[var(--chat-max-width)] px-4">
            {error && (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-error" aria-hidden />
                  <span>{t("chat.error")}</span>
                </span>
                <Button type="button" variant="outline" size="sm" onClick={retry}>
                  {t("chat.retry")}
                </Button>
              </div>
            )}
            <Composer
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              disabled={loading}
            />
            <p className="mt-3 text-center text-xs text-text-muted">
              {t("app.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
