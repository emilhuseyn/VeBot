import { useEffect } from "react";

export interface GlobalShortcutHandlers {
  /** ⌘/Ctrl+Shift+O — start a fresh chat. */
  onNewChat: () => void;
}

/** App-wide keyboard shortcuts. */
export function useGlobalShortcuts(handlers: GlobalShortcutHandlers): void {
  const { onNewChat } = handlers;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.shiftKey && event.code === "KeyO") {
        event.preventDefault();
        onNewChat();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNewChat]);
}
