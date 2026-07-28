import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore, type OperatorStep } from "@/store/chat";
import { useResolvedTheme } from "@/components/providers/global-effects";
import {
  loadTurnstile,
  turnstileLanguage,
  TURNSTILE_SITE_KEY,
} from "@/lib/turnstile";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

/** Mirrors the backend's own check so a typo is caught before a network trip. */
const PHONE_OK = /^\+?\d{7,15}$/;
const normalisePhone = (raw: string) => raw.replace(/[\s\-().]/g, "").trim();

const MAX_TEXTAREA_HEIGHT = 160;

/**
 * The operator hand-off input. It replaces the disclaimer strip at the bottom
 * of the chat while a hand-off is in progress, and walks the visitor through
 * phone → question → submit.
 */
export function OperatorPanel() {
  const { t, locale } = useI18n();
  const theme = useResolvedTheme();
  const step = useChatStore((s) => s.operatorStep);
  const submitPhone = useChatStore((s) => s.submitOperatorPhone);
  const submitMessage = useChatStore((s) => s.submitOperatorMessage);
  const cancel = useChatStore((s) => s.cancelOperator);

  const [value, setValue] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Turnstile lives for the whole hand-off; the token is minted for the submit.
  const widgetHostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string>("");
  const tokenWaitersRef = useRef<((token: string) => void)[]>([]);

  const isSending = step === "sending";
  const active = step !== "idle";

  // Focus the control for the new step. The draft is cleared on a *forward*
  // transition only: bouncing back from a failed submit (sending → message)
  // must keep the typed question, or every 403/timeout would erase it.
  const prevStepRef = useRef<OperatorStep>("idle");
  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = step;
    if (step === "phone") {
      setValue("");
      setPhoneError(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (step === "message") {
      if (prev !== "sending") setValue("");
      setPhoneError(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [step]);

  // Return focus to wherever the hand-off started (usually the operator
  // chip) when the panel closes — otherwise focus silently drops to <body>.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (active) {
      const el = document.activeElement;
      returnFocusRef.current =
        el instanceof HTMLElement && el !== document.body ? el : null;
    } else {
      const el = returnFocusRef.current;
      returnFocusRef.current = null;
      if (el?.isConnected) el.focus();
    }
  }, [active]);

  // Auto-grow the question textarea.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el || step !== "message") return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [value, step]);

  // Render the Turnstile widget once the hand-off starts; remove it when done.
  // Theme and language are render-time-only options, so a mid-hand-off theme
  // or locale switch re-renders the widget rather than leaving it stale.
  const renderedWithRef = useRef<{ theme: string; locale: string } | null>(null);
  useEffect(() => {
    if (!active || !TURNSTILE_SITE_KEY) return;
    let cancelled = false;

    void loadTurnstile()
      .then((turnstile) => {
        const host = widgetHostRef.current;
        if (cancelled || !host) return;
        const rendered = renderedWithRef.current;
        if (
          widgetIdRef.current &&
          rendered &&
          (rendered.theme !== theme || rendered.locale !== locale)
        ) {
          try {
            turnstile.remove(widgetIdRef.current);
          } catch {
            /* already gone */
          }
          widgetIdRef.current = null;
          tokenRef.current = "";
        }
        if (widgetIdRef.current) return;
        renderedWithRef.current = { theme, locale };
        widgetIdRef.current = turnstile.render(host, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          size: "flexible",
          language: turnstileLanguage(locale),
          callback: (token) => {
            tokenRef.current = token;
            tokenWaitersRef.current.splice(0).forEach((resolve) => resolve(token));
          },
          "expired-callback": () => {
            tokenRef.current = "";
          },
          "error-callback": () => {
            tokenRef.current = "";
            tokenWaitersRef.current.splice(0).forEach((resolve) => resolve(""));
          },
        });
      })
      .catch(() => {
        // Script blocked/offline: submit anyway with an empty token so the
        // backend answers with its own verification message.
        tokenWaitersRef.current.splice(0).forEach((resolve) => resolve(""));
      });

    return () => {
      cancelled = true;
    };
  }, [active, theme, locale]);

  // Tear the widget down when the hand-off ends.
  useEffect(() => {
    if (active) return;
    const id = widgetIdRef.current;
    if (id && window.turnstile) {
      try {
        window.turnstile.remove(id);
      } catch {
        /* already gone */
      }
    }
    widgetIdRef.current = null;
    tokenRef.current = "";
    tokenWaitersRef.current = [];
  }, [active]);

  /** Resolve with the current token, waiting briefly if it is still pending. */
  const getToken = useCallback((): Promise<string> => {
    if (tokenRef.current) return Promise.resolve(tokenRef.current);
    if (!TURNSTILE_SITE_KEY) return Promise.resolve("");
    return new Promise<string>((resolve) => {
      tokenWaitersRef.current.push(resolve);
      // Don't hang the UI if the challenge never resolves.
      window.setTimeout(() => {
        const i = tokenWaitersRef.current.indexOf(resolve);
        if (i !== -1) {
          tokenWaitersRef.current.splice(i, 1);
          resolve(tokenRef.current);
        }
      }, 12000);
    });
  }, []);

  const resetTurnstile = useCallback(() => {
    tokenRef.current = "";
    const id = widgetIdRef.current;
    if (id && window.turnstile) {
      try {
        window.turnstile.reset(id);
      } catch {
        /* widget gone — nothing to reset */
      }
    }
  }, []);

  if (!active) return null;

  const handlePhone = () => {
    const cleaned = normalisePhone(value);
    if (!PHONE_OK.test(cleaned)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    submitPhone(cleaned, t("operator.askMessage"));
  };

  const handleMessage = () => {
    if (!value.trim() || isSending) return;
    void submitMessage(value, getToken).then((res) => {
      // Turnstile tokens are single-use: a failed submit needs a fresh one.
      if (res.shouldResetTurnstile) resetTurnstile();
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel(t("operator.cancelled"));
      return;
    }
    if (event.key !== "Enter") return;
    if (step === "phone") {
      event.preventDefault();
      handlePhone();
      return;
    }
    if (step === "message" && !event.shiftKey) {
      const native = event.nativeEvent as unknown as { isComposing?: boolean };
      if (native.isComposing) return;
      event.preventDefault();
      handleMessage();
    }
  };

  return (
    <div className="rounded-2xl border bg-surface p-3 shadow-sm motion-safe:animate-rise-in">
      <div className="flex items-start gap-2">
        {step === "phone" ? (
          <input
            ref={inputRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setPhoneError(false);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("operator.phonePlaceholder")}
            aria-label={t("operator.askPhone")}
            aria-invalid={phoneError}
            className={cn(
              "min-h-[44px] flex-1 rounded-xl border bg-bg px-3 text-text",
              "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50",
              phoneError && "border-error focus:ring-error/40",
            )}
          />
        ) : (
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isSending}
            placeholder={t("operator.messagePlaceholder")}
            aria-label={t("operator.askMessage")}
            maxLength={2000}
            className={cn(
              "min-h-[44px] flex-1 resize-none rounded-xl border bg-bg px-3 py-2.5 text-text",
              "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50",
              "disabled:opacity-60",
            )}
          />
        )}

        <Button
          type="button"
          variant="primary"
          size="icon"
          className="rounded-full"
          disabled={isSending || value.trim().length === 0}
          onClick={step === "phone" ? handlePhone : handleMessage}
          aria-label={step === "phone" ? t("operator.next") : t("operator.send")}
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          disabled={isSending}
          onClick={() => cancel(t("operator.cancelled"))}
          aria-label={t("operator.cancel")}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {phoneError && (
        <p className="mt-2 text-xs text-error">{t("operator.phoneInvalid")}</p>
      )}

      {/*
        Honeypot: a real field, hidden with CSS rather than type="hidden" (bots
        fill those too). It is never submitted with a value — sendOperatorRequest
        always posts an empty `website`.
      */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Cloudflare Turnstile. Empty (0px) until the challenge needs to show. */}
      <div ref={widgetHostRef} className="mt-2 empty:mt-0" />

      {isSending && (
        <p className="mt-2 text-xs text-text-muted">{t("operator.sending")}</p>
      )}
    </div>
  );
}
