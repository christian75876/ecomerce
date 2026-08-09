import Box from '@atoms/box/SimpleBox';
import Image from '@atoms/image/SimpleImage';
import Typography from '@atoms/typography/SimpleTypography';

import iconCompany from '@assets/media/images/icon.svg';

interface LogoWithTextProps {
  logo?: string;
  title: string;
  subtitle: string;
  size?: 'sm' | 'md' | 'lg'; // Tamaños predefinidos
}

const sizeClasses = {
  sm: { logo: 'w-10', title: 'text-lg', subtitle: 'text-sm' },
  md: { logo: 'w-16', title: 'text-xl', subtitle: 'text-lg' },
  lg: { logo: 'w-24', title: 'text-2xl', subtitle: 'text-xl' }
};

const LogoWithText = ({
  logo = iconCompany,
  title,
  subtitle,
  size = 'md'
}: LogoWithTextProps) => {
  return (
    <Box className='flex items-center gap-2.5'>
      <Image
        src={logo}
        alt='Logo Merku'
        className={sizeClasses[size].logo}
      />
      <Box>
        <Typography
          variant='p'
          className={`font-extrabold leading-tight tracking-tight text-neutral-dark ${sizeClasses[size].title}`}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant='p'
            className={`text-neutral-muted ${sizeClasses[size].subtitle}`}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

export default LogoWithText;