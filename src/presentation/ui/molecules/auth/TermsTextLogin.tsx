import Link from '@atoms/link/Simplelink';
import Typography from '@atoms/typography/SimpleTypography';

const TermsText = () => {
  return (
    <Typography
      variant='p'
      className='text-sm text-neutral-dark text-center mt-4'
    >
      Al continuar, aceptas nuestros{' '}
      <Link to='#' className='text-primary hover:underline'>
        Términos de servicio
      </Link>{' '}
      y confirmas que has leído nuestra{' '}
      <Link to='#' className='text-primary hover:underline'>
        Política de privacidad
      </Link>
      .
    </Typography>
  );
};

export default TermsText;
