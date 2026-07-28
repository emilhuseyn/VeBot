export type Theme = "light" | "dark" | "system";

export type Locale = "az" | "en" | "ru";

export type FontSize = "sm" | "md" | "lg";

/* ── Web FAQ API wire types (mirror AbituriBack /web/* contract) ───────── */

export type MenuLevel = "top" | "subcat" | "sub";

export interface MenuItem {
  id: string;
  label: string;
  /**
   * Present when the row leads to nothing but a link (e.g. the virtual tour).
   * The row is then rendered as an anchor, so the tap itself opens the link —
   * no round-trip, and no popup blocker to fight.
   */
  url?: string;
}

export interface Menu {
  level: MenuLevel;
  title: string;
  body: string;
  category_id: string | null;
  subcategory_id: string | null;
  page: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
  has_back: boolean;
  items: MenuItem[];
}

/**
 * Optional image fields the backend MAY attach to a message once images go
 * live. The exact shape isn't finalized on the backend yet, so we accept every
 * common convention (see `extractImages` in lib/images.ts) rather than commit
 * to one. All fields are optional and ignored when absent.
 */
export interface RawImageFields {
  image?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  images?:
    | Array<
        | string
        | {
            url?: string;
            src?: string;
            image?: string;
            image_url?: string;
            alt?: string;
            caption?: string;
          }
      >
    | null;
}

export type WebMessage =
  // `url` is set when the answer is nothing but a link, so it can be offered
  // as a button rather than printed as a bare address to copy.
  | ({ type: "text"; text: string; url?: string } & RawImageFields)
  | ({ type: "menu"; menu: Menu } & RawImageFields)
  | ({
      type: "image";
      url?: string;
      src?: string;
      alt?: string;
      caption?: string;
    } & RawImageFields);

export interface WebMessageResponse {
  messages: WebMessage[];
}

/** A resolved image ready to render in the transcript. */
export interface ChatImage {
  url: string;
  alt?: string;
  caption?: string;
}

/** Built-in navigation selection ids understood by the backend engine. */
export const NAV = {
  home: "nav:home",
  back: "nav:back",
  next: "nav:next",
  prev: "nav:prev",
} as const;

/* ── Frontend transcript model ─────────────────────────────────────────── */

export type ChatEntry =
  | { id: string; role: "user"; text: string; createdAt: number }
  | {
      id: string;
      role: "bot";
      kind: "text";
      text: string;
      images?: ChatImage[];
      /** Set when the answer is only a link — rendered as an "open" button. */
      url?: string;
      createdAt: number;
    }
  | {
      id: string;
      role: "bot";
      kind: "menu";
      menu: Menu;
      /**
       * Set when this menu arrived in the same response as a text answer —
       * i.e. it is the backend re-showing the question list right after
       * answering. Rendered collapsed to just the Back / Home controls.
       * Decided at entry creation, not at render time: inferring it from the
       * neighbouring transcript entry misfires when a locally-generated bot
       * bubble (operator prompt, cancel note) sits in between.
       */
      navOnly?: boolean;
      createdAt: number;
    };
