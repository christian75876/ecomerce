import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

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
    <Box className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
      <Box className='flex flex-col gap-3'>
        <Typography variant='h1' className='text-3xl font-bold'>
          {title}
        </Typography>
        {description ? (
          <Typography className='max-w-4xl text-neutral-dark/70'>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
};

export default FeatureScreenHeader;
