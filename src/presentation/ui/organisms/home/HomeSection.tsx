import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface HomeSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const HomeSection = ({
  title,
  subtitle,
  children,
  className = '',
}: HomeSectionProps) => {
  return (
    <Box className={`surface-panel rounded-[2rem] p-6 ${className}`.trim()}>
      <Typography variant='h2' className='text-2xl font-semibold'>
        {title}
      </Typography>
      {subtitle ? (
        <Typography className='mt-2 text-sm text-neutral-dark/65'>
          {subtitle}
        </Typography>
      ) : null}
      <Box className='mt-6'>{children}</Box>
    </Box>
  );
};

export default HomeSection;
