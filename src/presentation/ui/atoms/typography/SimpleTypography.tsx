interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  children: React.ReactNode;
}

const Typography = ({
  variant = 'p',
  className,
  children
}: TypographyProps) => {
  const Tag: React.ElementType = variant || 'p';

  return <Tag className={`text-neutral-dark ${className}`}>{children}</Tag>;
};

export default Typography;
