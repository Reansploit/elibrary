import { useState, useEffect } from 'react';

/**
 * useFormShake — returns motion props that trigger a horizontal shake
 * whenever the errors object transitions from empty → non-empty.
 *
 * Usage:
 *   const shake = useFormShake(errors);
 *   <motion.form key={shake.key} variants={shake.variants} animate={shake.animate}>
 */
export function useFormShake(errors) {
  // Alternate between two keys so framer-motion re-mounts the animation
  const [shakeKey, setShakeKey] = useState('idle');
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (hasErrors) {
      setShakeKey((prev) => (prev === 'shake' ? 'shake-2' : 'shake'));
    }
  }, [hasErrors]);

  return {
    variants: {
      shake: {
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
      'shake-2': {
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
      idle: { x: 0 },
    },
    animate: hasErrors ? shakeKey : 'idle',
    key: hasErrors ? shakeKey : 'idle',
  };
}
