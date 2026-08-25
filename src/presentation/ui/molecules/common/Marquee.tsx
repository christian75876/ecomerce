interface MarqueeProps {
  items: string[];
  className?: string;
}

/**
 * Infinite horizontal ticker — the "market signage" signature element.
 *
 * Two identical tracks sit side by side, each animating its own
 * translateX(0 → -100%) (animate-marquee-track in palette.tailwind.css).
 * As track A slides fully out of view, track B — which started right where
 * A ended — is exactly back where A began, so the loop never depends on
 * measuring a combined width: each track's -100% is always exact relative
 * to itself. Splitting the loop into two -50%-of-combined-width halves (the
 * previous approach) instead requires the two copies to sub-pixel-match a
 * computed combined width, which drifts by a fraction of a pixel and shows
 * up as a visible stutter at the seam. The whole strip is aria-hidden since
 * it's decorative repetition of copy that's meaningful elsewhere on the
 * page, not new information a screen reader needs to announce.
 */
const Marquee = ({ items, className = '' }: MarqueeProps) => {
  const track = (
    <div className='flex shrink-0 animate-marquee-track'>
      {items.map((item, i) => (
        <span
          key={i}
          className='flex items-center gap-3 whitespace-nowrap px-5 font-display text-sm font-bold uppercase tracking-[0.15em]'
        >
          {item}
          <span className='text-highlight'>●</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`flex overflow-hidden ${className}`} aria-hidden='true'>
      {track}
      {track}
    </div>
  );
};

export default Marquee;
