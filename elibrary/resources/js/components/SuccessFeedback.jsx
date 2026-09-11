import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * SuccessFeedback — animated checkmark with burst ring & text.
 *
 * Usage:
 *   <SuccessFeedback show={recentlySuccessful} message="Tersimpan." />
 */
export default function SuccessFeedback({ show = false, message = 'Tersimpan.' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="success-feedback"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
        >
          {/* Checkmark icon */}
          <span className="relative flex size-5 items-center justify-center">
            <motion.span
              key="burst"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-emerald-500"
            />
            <Check className="relative size-4" />
          </span>
          {message}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
