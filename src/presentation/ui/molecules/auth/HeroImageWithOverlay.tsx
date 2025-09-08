// HeroImageWithOverlay.tsx
import React from 'react';
import Box from '@atoms/box/SimpleBox';
import Image from '@atoms/image/SimpleImage';
import loginImage from '@assets/media/images/image-get-started.jpeg';

interface HeroImageWithOverlayProps {
  src?: string;
  alt?: string;
  overlayClassName?: string;
  className?: string;
}

const HeroImageWithOverlay: React.FC<HeroImageWithOverlayProps> = ({
  src = loginImage,
  alt = 'Background',
  overlayClassName = 'bg-gradient-to-r from-black/40 via-black/20 to-transparent',
  className = ''
}) => {
  return (
    <Box
      className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      <Image
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </Box>
  );
};

export default HeroImageWithOverlay;
