import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

/**
 * GradientOrb — a large radial gradient that follows the mouse cursor.
 * Renders as a single blurred orb behind the content.
 *
 * @param {string[]} colors  — gradient color stops (default: primary→purple→pink)
 * @param {number}   size    — orb diameter in px
 * @param {number}   opacity — base opacity (0–1)
 */
export default function GradientOrb({
  colors = [
    'oklch(0.511 0.262 276.966)',
    'oklch(0.6 0.3 300)',
    'oklch(0.7 0.2 330)',
  ],
  size = 600,
  opacity = 0.15,
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth following
  const springX = useSpring(mouseX, { stiffness: 30, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 25 });

  // Centre the orb on the cursor
  const x = useTransform(springX, (v) => v - size / 2);
  const y = useTransform(springY, (v) => v - size / 2);

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed z-0"
      style={{ x, y, width: size, height: size, opacity }}
      aria-hidden
    >
      <div
        className="size-full rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at center, ${colors[0]} 0%, ${colors[1]} 40%, ${colors[2]} 80%)`,
        }}
      />
    </motion.div>
  );
}
