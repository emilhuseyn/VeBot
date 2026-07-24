export type Theme = "light" | "dark" | "system";

export type Locale = "az" | "en" | "ru";

export type FontSize = "sm" | "md" | "lg";

/* ── Web FAQ API wire types (mirror AbituriBack /web/* contract) ───────── */

export type MenuLevel = "top" | "subcat" | "sub";

export interface MenuItem {
  id: string;
  label: string;
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
  | ({ type: "text"; text: string } & RawImageFields)
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
      createdAt: number;
    }
  | {
      id: string;
      role: "bot";
      kind: "menu";
      menu: Menu;
      createdAt: number;
    };
