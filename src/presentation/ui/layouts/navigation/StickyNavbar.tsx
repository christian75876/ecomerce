import Box from '@atoms/box/SimpleBox';

interface StickyNavbarProps {
  children: React.ReactNode;
}

const StickyNavbar = ({ children }: StickyNavbarProps) => {
  return (
    <Box className='surface-card sticky top-3 z-40 mx-auto mt-3 flex w-full items-center justify-between rounded-[1.6rem] px-4 py-3 sm:px-6'>
      {children}
    </Box>
  );
};

export default StickyNavbar;
