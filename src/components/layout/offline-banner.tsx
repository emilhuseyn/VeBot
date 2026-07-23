import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/hooks";
import { useI18n } from "@/i18n";

export function OfflineBanner() {
  const { t } = useI18n();
  const online = useOnlineStatus();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {!online && (
        <motion.div
          role="status"
          className="shrink-0 overflow-hidden border-b border-warning/30 bg-warning/10"
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium text-warning">
            <WifiOff className="h-3.5 w-3.5" aria-hidden />
            {t("offline.banner")}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
