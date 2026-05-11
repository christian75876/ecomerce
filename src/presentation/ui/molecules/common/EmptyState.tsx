import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <Box className='rounded-[1.8rem] border border-dashed border-neutral-gray/50 bg-white/70 px-6 py-12 text-center shadow-sm'>
      <Typography variant='h3'>{title}</Typography>
      <Typography className='mt-2 text-sm text-neutral-dark/60'>
        {description}
      </Typography>
    </Box>
  );
};

export default EmptyState;
