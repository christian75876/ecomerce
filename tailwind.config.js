/**
 * Tailwind v4 reads config from CSS (@theme in src/assets/styles/
 * palette.tailwind.css), not from this file — there's no @config directive
 * wiring this in. `content` below is the one thing v4's own auto-detection
 * doesn't cover for this project's layout, so this file stays for that
 * only. Do not add theme.extend here; it will be silently ignored.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
};
