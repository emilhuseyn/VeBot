# BDU Abituriyent Köməkçisi

A polished web **FAQ chat widget** for Baku State University applicants (abituriyents),
built against the **AbituriBack** `/web` conversational API. Menu-driven
(category → sub-category → question → verbatim answer) — **no AI/LLM involved**;
every answer is exact FAQ text from the backend.

React 18 + TypeScript (strict) + Vite + Tailwind CSS v4 + Radix + Zustand + Framer Motion.
UI chrome localized (AZ / EN / RU); FAQ content is Azerbaijani.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

Out of the box it runs against a built-in **offline mock** of the backend, so no server
is required to develop or demo.

## Connecting the real backend

```bash
# .env
VITE_API_BASE=https://<your-abituriback-service>
VITE_TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>   # optional, see below
```

When `VITE_API_BASE` is set, all calls hit the real backend
(`POST /web/message`, `POST /web/reset`, `GET /web/menu`,
`POST /web/operator-request`); when it is empty, the in-repo mock engine
([`src/services/faq-mock.ts`](src/services/faq-mock.ts)) answers from sample data.
The single integration point is
[`src/services/faq-api.ts`](src/services/faq-api.ts). Ask the backend owner to add this
frontend's origin to `WEB_CORS_ORIGINS`.

`VITE_TURNSTILE_SITE_KEY` is the **public** Cloudflare Turnstile site key used by the
operator hand-off form. When it is unset, the "Operatorla əlaqə" action is hidden
entirely (the backend fails closed without a token, so offering the form would be
pointless). The matching **secret** key lives on the backend host (Render), never here.

## How it works

- **Conversational API** (per the backend's recommended integration): the frontend
  keeps a `session_id` in `localStorage` and renders whatever the engine returns —
  `text` bubbles and `menu` bubbles (tappable option rows + Back / Home / Prev / Next).
- Tapping an option sends its `id` as `selection_id`. There is no free-text input —
  the widget is strictly menu-driven.
- Only the **latest** menu stays interactive; earlier menus become a read-only record.
- The sidebar lists top-level categories (from `GET /web/menu`) as one-tap shortcuts.
- **Operator hand-off**: after an answer, "Operatorla əlaqə" walks the visitor through
  phone → question and posts both to `POST /web/operator-request`, gated by Turnstile.

## Structure

```
src/
  components/
    layout/     Sidebar (category shortcuts), TopBar (restart), OfflineBanner
    chat/       ChatArea, Transcript, MenuBubble, OperatorPanel, TypingIndicator
    global/     SettingsDialog (theme / font size)
    ui/         Radix-based primitives styled with design tokens
  store/        Zustand: chat (session + transcript), settings, ui
  services/     faq-api.ts (mock ⇄ real swap), faq-mock.ts, faq-data.ts, persistence.ts
  i18n/         az / en / ru dictionaries + t() helper (AZ default)
  styles/       tokens.css (design tokens), globals.css (Tailwind v4 theme)
  lib/          types (wire + transcript models), utils, hooks, shortcuts
```

## Notes

- All user-facing FAQ text is Azerbaijani (no server-side i18n); `\n` line breaks are
  preserved when rendering.
- No authentication on `/web/*`; don't put secrets in the frontend.
- `WEB_PAGE_SIZE` defaults to 0 on the backend (all items on one page), so pagination
  controls exist in the UI but may never trigger unless the backend enables paging.
