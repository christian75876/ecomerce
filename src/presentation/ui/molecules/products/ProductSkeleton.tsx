import Box from '@atoms/box/SimpleBox';

const ProductSkeleton = () => {
  return (
    <Box className='overflow-hidden rounded-[1.8rem] border border-neutral-gray/20 bg-white shadow-sm'>
      <div className='h-44 animate-pulse bg-neutral-gray/30' />
      <Box className='space-y-3 p-4'>
        <div className='h-3 w-20 animate-pulse rounded-full bg-neutral-gray/30' />
        <div className='h-5 w-4/5 animate-pulse rounded-full bg-neutral-gray/30' />
        <div className='h-4 w-2/3 animate-pulse rounded-full bg-neutral-gray/20' />
        <div className='h-4 w-1/2 animate-pulse rounded-full bg-neutral-gray/20' />
        <div className='mt-4 h-10 animate-pulse rounded-2xl bg-neutral-gray/20' />
      </Box>
    </Box>
  );
};

export default ProductSkeleton;
