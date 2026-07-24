import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
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
  const retry = useChatStore((s) => s.retry);

  const [pinned, setPinned] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);
  // Drives the "bring the question to the top" behaviour for each new turn.
  const focusUserIdRef = useRef<string | null>(null);
  const prevLastUserIdRef = useRef<string | null>(null);

  // Send the greeting turn once history has rehydrated and is empty.
  useEffect(() => {
    if (hydrated && entries.length === 0) start();
  }, [hydrated, entries.length, start]);

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
  const lastEntry = entries[entries.length - 1];
  const lastText = lastEntry?.role === "user" ? "user" : lastEntry?.id ?? "";

  // Id of the most recent user message (the tapped question / typed text).
  let lastUserId: string | null = null;
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const e = entries[i];
    if (e?.role === "user") {
      lastUserId = e.id;
      break;
    }
  }

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // A new question was sent → show it + the typing indicator at the bottom
    // for now, and remember to re-focus it once the reply lands.
    if (lastUserId && lastUserId !== prevLastUserIdRef.current) {
      prevLastUserIdRef.current = lastUserId;
      focusUserIdRef.current = lastUserId;
      el.scrollTop = el.scrollHeight;
      pinnedRef.current = true;
      setPinned(true);
      return;
    }

    // The reply for the focused turn has arrived → scroll that question up to
    // the top so a long answer is read from its beginning, instead of jumping
    // to the very bottom (the re-shown menu, past the answer).
    if (focusUserIdRef.current && !loading) {
      const id = focusUserIdRef.current;
      focusUserIdRef.current = null;
      const node = el.querySelector<HTMLElement>(`[data-entry-id="${id}"]`);
      if (node) {
        const offset =
          node.getBoundingClientRect().top - el.getBoundingClientRect().top;
        el.scrollTop = el.scrollTop + offset - 12;
        pinnedRef.current = false;
        setPinned(false);
        return;
      }
    }

    // Default: keep pinned to the bottom (initial greeting, or user at bottom).
    if (pinnedRef.current) el.scrollTop = el.scrollHeight;
  }, [entryCount, lastText, loading, lastUserId]);

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
        <div className="bg-bg/85 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
          <div className="mx-auto w-full max-w-[var(--chat-max-width)] px-4">
            {/* Without a text input, the retry button is the only way to recover
                from a failed request, so keep the error strip. */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
