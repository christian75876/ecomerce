import clsx from 'clsx';

interface IconProps {
  name: string;
  size?: number; // Tamaño opcional en píxeles
  className?: string;
}

const Icon = ({ name, size = 24, className }: IconProps) => {
  return (
    <i
      className={clsx(`bx ${name}`, className)}
      style={{ fontSize: `${size}px` }}
      aria-hidden='true'
    ></i>
  );
};

export default Icon;
