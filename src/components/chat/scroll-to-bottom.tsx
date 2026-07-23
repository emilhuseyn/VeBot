import { ArrowDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n";

/** Floating pill above the composer that returns the user to the latest message. */
export function ScrollToBottomButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const offset = reduceMotion ? 0 : 8;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          onClick={onClick}
          aria-label={t("chat.scrollToBottom")}
          initial={{ opacity: 0, y: offset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: offset }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="grid h-9 w-9 place-items-center rounded-full border bg-bg text-text-muted shadow-md transition-colors hover:bg-surface hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <ArrowDown className="h-4 w-4" aria-hidden />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
