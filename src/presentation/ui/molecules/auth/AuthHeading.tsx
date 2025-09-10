import React from 'react';
import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';

interface AuthHeadingProps {
  title: string;
  subtitle: string;
  highlight?: string;
}

const AuthHeading: React.FC<AuthHeadingProps> = ({
  title,
  subtitle,
  highlight
}) => {
  return (
    <Box className='mb-5 mt-7'>
      <Typography variant='h1' className='text-4xl font-bold text-white'>
        {title}
      </Typography>
      <Typography variant='p' className='text-white mt-2'>
        {subtitle}{' '}
        {highlight && (
          <span className='text-primary font-semibold'>{highlight}</span>
        )}
      </Typography>
    </Box>
  );
};

export default AuthHeading;
