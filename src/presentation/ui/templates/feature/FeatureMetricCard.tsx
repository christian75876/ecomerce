import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface FeatureMetricCardProps {
  label: string;
  value: React.ReactNode;
  helper?: string;
}

const FeatureMetricCard = ({
  label,
  value,
  helper,
}: FeatureMetricCardProps) => {
  return (
    <Box className='surface-card p-5'>
      <Typography variant='span' className='text-neutral-dark/55'>
        {label}
      </Typography>
      <Typography variant='h2' className='mt-3 text-3xl'>
        {value}
      </Typography>
      {helper ? (
        <Typography className='mt-2 text-sm text-neutral-dark/65'>
          {helper}
        </Typography>
      ) : null}
    </Box>
  );
};

export default FeatureMetricCard;
