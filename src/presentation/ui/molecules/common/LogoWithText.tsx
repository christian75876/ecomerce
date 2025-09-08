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
    <Box className='flex items-center space-x-3'>
      <Image
        src={logo}
        alt='Logo Hot Ecomerce'
        className={sizeClasses[size].logo}
      />
      <Box>
        <Typography
          variant='p'
          className={`font-semibold text-neutral-dark leading-tight ${sizeClasses[size].title}`}
        >
          {title}
        </Typography>
        <Typography
          variant='p'
          className={`text-neutral-dark ${sizeClasses[size].subtitle}`}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default LogoWithText;