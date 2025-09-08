import Box from '../../atoms/box/SimpleBox';
import Typography from '../../atoms/typography/SimpleTypography';

const ProductHeader = ({ title }: { title: string }) => {
  return (
    <>
      <Box>
        <Typography variant='h2' className='text-primary'>
          {title}
        </Typography>
      </Box>
    </>
  );
};

export default ProductHeader;
