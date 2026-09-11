import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   Password strength scoring (0–5)
   ───────────────────────────────────────────── */
function getScore(password) {
  let s = 0;
  if (!password) return 0;
  if (password.length >= 6) s++;
  if (password.length >= 10) s++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
  if (/\d/.test(password)) s++;
  if (/[^a-zA-Z0-9]/.test(password)) s++;
  return Math.min(s, 5);
}

const labels = ['', 'Sangat lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'];
const colors = [
  'bg-border',
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-emerald-500',
];
const textColors = [
  '',
  'text-red-600 dark:text-red-400',
  'text-orange-600 dark:text-orange-400',
  'text-yellow-600 dark:text-yellow-400',
  'text-lime-600 dark:text-lime-400',
  'text-emerald-600 dark:text-emerald-400',
];

/* ─────────────────────────────────────────────
   PasswordStrength
   ───────────────────────────────────────────── */
export default function PasswordStrength({ password }) {
  const score = password ? getScore(password) : 0;
  const show = password && password.length > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="strength"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          className="space-y-1.5 overflow-hidden"
        >
          {/* Bar segments */}
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < score ? colors[score] : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Label */}
          {score > 0 && (
            <p className={`text-xs font-medium ${textColors[score]}`}>
              {labels[score]}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
