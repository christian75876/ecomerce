import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface PurchaseModalShellProps {
  title: string;
  description: string;
  maxWidthClassName?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const PurchaseModalShell = ({
  title,
  description,
  maxWidthClassName = 'max-w-2xl',
  onClose,
  children,
}: PurchaseModalShellProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    setMounted(true);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      setMounted(false);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <Box
      className='fixed inset-0 z-[90] overflow-y-auto bg-neutral-dark/45 px-4 py-6 backdrop-blur-sm'
      onClick={onClose}
    >
      <Box className='flex min-h-full items-center justify-center'>
        <Box
          className={`relative w-full max-h-[90vh] overflow-y-auto ${maxWidthClassName} rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]`}
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClose}
            className='absolute right-4 top-4 min-w-0 rounded-full px-3 py-2 text-lg leading-none'
            aria-label='Cerrar modal'
          >
            ×
          </Button>

          <Box className='flex items-start justify-between gap-4'>
            <Box className='pr-12'>
              <Typography variant='h2' className='text-xl font-semibold'>
                {title}
              </Typography>
              <Typography className='mt-2 text-sm text-neutral-dark/65'>
                {description}
              </Typography>
            </Box>
          </Box>

          {children}
        </Box>
      </Box>
    </Box>
    ,
    document.body
  );
};

export default PurchaseModalShell;
