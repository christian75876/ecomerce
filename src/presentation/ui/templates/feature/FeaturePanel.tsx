import Box from '@/presentation/ui/atoms/box/SimpleBox';

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
      className={`rounded-2xl bg-white p-6 ${className}`.trim()}
      style={{
        border: '1px solid rgba(99, 102, 241, 0.1)',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 8px 32px rgba(99,102,241,0.06)',
      }}
    >
      {title || subtitle || action ? (
        <Box className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
          <Box>
            {title ? (
              <h2 className='text-[17px] font-semibold tracking-tight text-slate-800'>
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className='mt-1.5 text-sm text-slate-400'>
                {subtitle}
              </p>
            ) : null}
          </Box>
          {action}
        </Box>
      ) : null}

      <Box className={title || subtitle || action ? 'mt-5' : ''}>{children}</Box>
    </Box>
  );
};

export default FeaturePanel;
