import Box from '@/presentation/ui/atoms/box/SimpleBox';

interface HomeSectionProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const HomeSection = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}: HomeSectionProps) => {
  return (
    <Box className={`${className}`.trim()}>
      <Box className='mb-4 flex items-end justify-between gap-4'>
        <Box>
          <h2 className='text-xl font-bold tracking-tight text-slate-900'>{title}</h2>
          {subtitle ? (
            <p className='mt-0.5 text-sm text-slate-500'>{subtitle}</p>
          ) : null}
        </Box>
        {action ? <Box className='flex-shrink-0'>{action}</Box> : null}
      </Box>
      {children}
    </Box>
  );
};

export default HomeSection;
