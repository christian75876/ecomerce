import clsx from 'clsx';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  speed?: 'slow' | 'normal' | 'fast';
}

const Loader = ({
  size = 'md',
  color = 'primary',
  speed = 'normal'
}: LoaderProps) => {
  return (
    <div
      className={clsx(
        'border-4 border-t-transparent rounded-full animate-spin',
        {
          'w-4 h-4': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-10 h-10': size === 'lg',

          'border-primary-light': color === 'primary',
          'border-secondary-light': color === 'secondary',
          'border-white': color === 'white',
          'border-neutral-gray': color === 'gray',

          'animate-spin-slow': speed === 'slow',
          'animate-spin': speed === 'normal',
          'animate-spin-fast': speed === 'fast'
        }
      )}
    />
  );
};

export default Loader;
