/**
 * Shared animation timing tokens for framer-motion. Mirrors the CSS
 * durations/easings in tailwind.config.js and palette.tailwind.css so
 * JS-driven and CSS-driven animation read as one system, not two.
 */

/** Bouncy — hover micro-interactions (card tilt, button press). */
export const EASE_SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/** Smooth — scroll-reveals and section transitions. */
export const EASE_SMOOTH: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export const DURATION = {
  hover: 0.2,
  reveal: 0.6,
  revealSlow: 0.85,
} as const;
