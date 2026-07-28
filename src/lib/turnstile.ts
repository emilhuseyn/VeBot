/**
 * Cloudflare Turnstile loader + tiny typed wrapper.
 *
 * The backend verifies the token server-side and **fails closed**: no token
 * (or no secret configured there) means every POST /web/operator-request is
 * rejected with 403. Tokens are single-use, so any non-200 response must be
 * followed by `reset()` before the visitor can submit again.
 *
 * The site key is public by design; set it in `.env` as
 * `VITE_TURNSTILE_SITE_KEY` (and in the host's env for deploys).
 */

export const TURNSTILE_SITE_KEY = (
  import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ""
).trim();

/** Without a site key we cannot mint a token, so the operator form is hidden. */
export const TURNSTILE_CONFIGURED = TURNSTILE_SITE_KEY.length > 0;

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "compact" | "flexible";
  language?: string;
  appearance?: "always" | "execute" | "interaction-only";
}

interface TurnstileApi {
  render: (el: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

/** Inject the Turnstile script once and resolve when its API is ready. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="https://challenges.cloudflare.com/turnstile"]`,
    );
    const onReady = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile script loaded without an API"));
    };

    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Turnstile script failed to load")),
        { once: true },
      );
      // The script may already be parsed by the time we get here.
      if (window.turnstile) resolve(window.turnstile);
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Turnstile script failed to load")),
      { once: true },
    );
    document.head.appendChild(script);
  }).catch((error) => {
    // Allow a later retry rather than caching the failure forever.
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

export type { TurnstileApi, TurnstileRenderOptions };
