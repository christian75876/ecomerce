import Box from '@/presentation/ui/atoms/box/SimpleBox';

interface FeatureScreenHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const FeatureScreenHeader = ({
  title,
  description,
  action,
}: FeatureScreenHeaderProps) => {
  return (
    <Box className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
      <Box className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
          {title}
        </h1>
        {description ? (
          <p className='text-sm leading-relaxed text-slate-400 max-w-2xl'>
            {description}
          </p>
        ) : null}
      </Box>
      {action ? (
        <Box className='flex shrink-0 items-center gap-2'>
          {action}
        </Box>
      ) : null}
    </Box>
  );
};

export default FeatureScreenHeader;
