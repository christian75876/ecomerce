interface MarqueeProps {
  items: string[];
  className?: string;
}

/**
 * Infinite horizontal ticker — the "market signage" signature element.
 * Content is duplicated once so the 0%→-50% CSS loop (animate-marquee in
 * palette.tailwind.css) reads as seamless; the whole strip is aria-hidden
 * since it's decorative repetition of copy that's meaningful elsewhere on
 * the page, not new information a screen reader needs to announce.
 */
const Marquee = ({ items, className = '' }: MarqueeProps) => {
  const loopItems = [...items, ...items];

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden='true'>
      <div className='flex w-max animate-marquee'>
        {loopItems.map((item, i) => (
          <span
            key={i}
            className='flex items-center gap-3 whitespace-nowrap px-5 font-display text-sm font-bold uppercase tracking-[0.15em]'
          >
            {item}
            <span className='text-highlight'>●</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
