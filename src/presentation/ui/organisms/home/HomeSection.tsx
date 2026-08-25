import Box from '@/presentation/ui/atoms/box/SimpleBox';
import { Reveal } from '@/presentation/ui/molecules/common/Reveal';

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
      <Reveal effect='fade-up'>
        <Box className='mb-5 flex items-end justify-between gap-4'>
          <Box>
            <h2 className='font-display text-2xl font-extrabold tracking-tight text-neutral-dark'>{title}</h2>
            {subtitle ? (
              <p className='mt-0.5 text-sm text-neutral-muted'>{subtitle}</p>
            ) : null}
          </Box>
          {action ? <Box className='flex-shrink-0'>{action}</Box> : null}
        </Box>
      </Reveal>
      {children}
    </Box>
  );
};

export default HomeSection;
