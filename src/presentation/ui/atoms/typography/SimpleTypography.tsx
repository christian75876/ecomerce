interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Typography = ({
  variant = 'p',
  className,
  style,
  children
}: TypographyProps) => {
  const Tag: React.ElementType = variant || 'p';

  const baseClassName =
    variant === 'h1'
      ? 'text-4xl font-bold tracking-[-0.04em] md:text-5xl'
      : variant === 'h2'
        ? 'text-2xl font-semibold tracking-[-0.03em] md:text-3xl'
        : variant === 'h3'
          ? 'text-lg font-semibold tracking-[-0.02em]'
          : variant === 'span'
            ? 'text-sm font-medium'
            : 'text-base leading-7';

  return (
    <Tag className={`text-neutral-dark ${baseClassName} ${className || ''}`} style={style}>
      {children}
    </Tag>
  );
};

export default Typography;
