import Link from '@atoms/link/Simplelink';
import Typography from '@atoms/typography/SimpleTypography';
import { ROUTES } from '@/shared/constants/routes';

const TermsText = () => {
  return (
    <Typography
      variant='p'
      className='text-sm text-white text-center mt-4'
    >
      Al continuar, aceptas nuestros{' '}
      <Link to={ROUTES.PUBLIC.TERMS} className='text-primary hover:underline'>
        Términos de servicio
      </Link>{' '}
      y confirmas que has leído nuestra{' '}
      <Link to={ROUTES.PUBLIC.PRIVACY} className='text-primary hover:underline'>
        Política de privacidad
      </Link>
      .
    </Typography>
  );
};

export default TermsText;
