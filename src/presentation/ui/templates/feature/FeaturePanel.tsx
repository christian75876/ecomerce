import Box from '@/presentation/ui/atoms/box/SimpleBox';

interface FeaturePanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  /** Extra content (search/filters) rendered inside the sticky header, above `children`. */
  toolbar?: React.ReactNode;
  /** Keeps title/subtitle/action/toolbar pinned to the top while `children` scrolls underneath. */
  sticky?: boolean;
}

const FeaturePanel = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  toolbar,
  sticky = false,
}: FeaturePanelProps) => {
  const hasHeader = Boolean(title || subtitle || action || toolbar);

  const header = hasHeader ? (
    <>
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
      {toolbar ? <Box className={title || subtitle || action ? 'mt-4' : ''}>{toolbar}</Box> : null}
    </>
  ) : null;

  return (
    <Box
      className={`rounded-2xl bg-white p-6 ${className}`.trim()}
      style={{
        border: '1px solid rgba(99, 102, 241, 0.1)',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 8px 32px rgba(99,102,241,0.06)',
      }}
    >
      {hasHeader ? (
        sticky ? (
          <Box className='sticky top-0 z-20 -mx-6 -mt-6 rounded-t-2xl border-b border-slate-100 bg-white px-6 pb-4 pt-6'>
            {header}
          </Box>
        ) : (
          header
        )
      ) : null}

      <Box className={hasHeader ? 'mt-5' : ''}>{children}</Box>
    </Box>
  );
};

export default FeaturePanel;
