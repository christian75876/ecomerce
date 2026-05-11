import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface FeaturePanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const FeaturePanel = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}: FeaturePanelProps) => {
  return (
    <Box
      className={`rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm ${className}`.trim()}
    >
      {title || subtitle || action ? (
        <Box className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
          <Box>
            {title ? (
              <Typography variant='h2' className='text-xl font-semibold'>
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography className='mt-2 text-sm text-neutral-dark/65'>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Box>
      ) : null}

      <Box className={title || subtitle || action ? 'mt-6' : ''}>{children}</Box>
    </Box>
  );
};

export default FeaturePanel;
