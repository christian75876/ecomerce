const ProductSkeleton = () => {
  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
      {/* image skeleton — same aspect-[4/3] as card */}
      <div className='aspect-[4/3] w-full skeleton' />
      <div className='space-y-2.5 p-3'>
        <div className='h-3 w-16 skeleton rounded-full' />
        <div className='h-4 w-4/5 skeleton rounded-full' />
        <div className='h-4 w-3/5 skeleton rounded-full' />
        <div className='mt-3 flex items-center justify-between'>
          <div className='h-5 w-20 skeleton rounded-full' />
          <div className='h-8 w-24 skeleton rounded-xl' />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
