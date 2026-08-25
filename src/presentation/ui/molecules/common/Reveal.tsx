import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { DURATION, EASE_SMOOTH } from '@/shared/constants/motion';

type RevealEffect = 'fade-up' | 'fade' | 'scale';

interface RevealProps {
  children: ReactNode;
  /** Entrance style. Defaults to a soft upward fade — the workhorse for most sections. */
  effect?: RevealEffect;
  /** Seconds to wait before starting, for staggering a group of siblings. */
  delay?: number;
  className?: string;
  /** Slower variant for large hero-scale elements. */
  slow?: boolean;
  /** Re-trigger every time the element re-enters the viewport instead of only once. */
  repeat?: boolean;
}

const VARIANTS: Record<RevealEffect, Variants> = {
  'fade-up': {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
};

/**
 * Scroll-triggered entrance animation. Renders a plain, already-visible <div>
 * when the visitor has prefers-reduced-motion set — no transform/opacity
 * animation runs at all, rather than just a faster one.
 */
export const Reveal = ({
  children,
  effect = 'fade-up',
  delay = 0,
  className,
  slow = false,
  repeat = false,
}: RevealProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: !repeat, amount: 0.25 }}
      variants={VARIANTS[effect]}
      transition={{ duration: slow ? DURATION.revealSlow : DURATION.reveal, delay, ease: EASE_SMOOTH }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
