import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';

/**
 * RippleButton — shadcn Button with a click ripple effect.
 *
 * Usage: same props as shadcn Button plus optional rippleColor.
 */
export default function RippleButton({ children, className, onClick, rippleColor = 'rgba(255,255,255,0.35)', ...props }) {
    const btnRef = useRef(null);
    const [ripples, setRipples] = useState([]);
    let seq = useRef(0);

    const handleClick = useCallback(
        (e) => {
            const rect = btnRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = seq.current++;
            const size = Math.max(rect.width, rect.height) * 2;

            setRipples((prev) => [...prev, { id, x, y, size }]);

            // Clean up after animation
            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== id));
            }, 600);

            onClick?.(e);
        },
        [onClick],
    );

    return (
        <Button ref={btnRef} className={`relative overflow-hidden ${className || ''}`} onClick={handleClick} {...props}>
            {children}
            <AnimatePresence>
                {ripples.map((r) => (
                    <motion.span
                        key={r.id}
                        initial={{ scale: 0, opacity: 0.4 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="pointer-events-none absolute rounded-full"
                        style={{
                            left: r.x - r.size / 2,
                            top: r.y - r.size / 2,
                            width: r.size,
                            height: r.size,
                            backgroundColor: rippleColor,
                        }}
                    />
                ))}
            </AnimatePresence>
        </Button>
    );
}
