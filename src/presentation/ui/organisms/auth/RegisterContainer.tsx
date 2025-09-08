// Images imports

import { IRegisterForm } from '@/application/dtos/auth/register/register/RegisterRequest';
import Box from '../../atoms/box/SimpleBox';
import HeroImageWithOverlay from '../../molecules/auth/HeroImageWithOverlay';
import LogoWithText from '../../molecules/common/LogoWithText';
import AuthHeading from '../../molecules/auth/AuthHeading';
import TermsText from '../../molecules/auth/TermsTextLogin';
import AuthFormRegister from '../../molecules/auth/AuthFormRegister';
import { useRegister } from '@/application/useCases/auth/useRegister';
import { Link } from 'react-router-dom';

const RegisterCointainer = () => {
  const { isloading, handleRegister } = useRegister();

  const onSubmit = (data: IRegisterForm) => {
    handleRegister(data);
  };

  return (
    <Box className='flex w-full min-h-screen'>
      {/* Image with Gradient - Left */}
      <HeroImageWithOverlay />

      {/* Form Section with Gradient - Right */}
      <Box className='w-full lg:w-1/2 flex flex-col justify-center items-center px-16 py-10 gradient-right'>
        <Box className='w-full max-w-md'>
          <LogoWithText title='Hot' subtitle='Ecomerce' />

          <AuthHeading
            title='Regístrate'
            subtitle='Bienvenido a'
            highlight='Hot-Ecomerce!'
          />

          <AuthFormRegister onSubmit={onSubmit} isLoading={isloading} />
          <Box className='flex justify-end items-center text-md my-4'>
            <Link to='#' className='text-primary underline'>
              Recuperar contraseña
            </Link>
          </Box>
          <TermsText />
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterCointainer;
