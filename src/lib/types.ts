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

export type WebMessage =
  | { type: "text"; text: string }
  | { type: "menu"; menu: Menu };

export interface WebMessageResponse {
  messages: WebMessage[];
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
      createdAt: number;
    }
  | {
      id: string;
      role: "bot";
      kind: "menu";
      menu: Menu;
      createdAt: number;
    };
