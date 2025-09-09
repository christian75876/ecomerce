import { useCallback, useRef, useState } from 'react';
import Box from '@atoms/box/SimpleBox';
import AuthHeading from '@molecules/auth/AuthHeading';
import TermsText from '@molecules/auth/TermsTextLogin';
import LogoWithText from '@/presentation/ui/molecules/common/LogoWithText';
import { useLogin } from '@/application/useCases/auth/useLogin';
import { useRegister } from '@/application/useCases/auth/useRegister';
import ThreeRoot from '../../three/scenes/ThreeRoot';

import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import { IRegisterForm } from '@/application/dtos/auth/register/register/RegisterRequest';

import CardAuth from '@/presentation/ui/molecules/auth/CardAuth';
import Button from '../../atoms/button/SimpleButton';

const AuthContainer = () => {
  const [isRegister, setIsRegister] = useState(false);

  // Hooks
  const { isloading: isLoadingLogin, handleLogin } = useLogin();
  const { isloadingRegister: isLoadingRegister, handleRegister } = useRegister();

  // Submit handlers explícitos por tipo
  const onSubmitLogin = (data: ILoginRequest) => handleLogin(data);
  const onSubmitRegister = (data: IRegisterForm) => handleRegister(data);
  const apiRef = useRef<{ focusStore: (d?: number) => void; focusPlanet: (d?: number) => void } | null>(null);
const handleThreeReady = useCallback((api: { focusStore: (d?: number) => void; focusPlanet: (d?: number) => void }) => {
  apiRef.current = api;
}, []);

  return (
    <Box className="relative min-h-screen">
      <Box className="absolute inset-0 z-0">
      <ThreeRoot onReady={handleThreeReady} />
      </Box>

      <Box
        className="
        pointer-events-none
        absolute inset-0 z-10
        grid place-items-center
          lg:grid-cols-[1fr_auto] lg:gap-12
          px-6
          lg:mr-18
        "
      >
        <div className="hidden lg:block" />
            

        <Box
          className={`
            pointer-events-auto
            w-full max-w-md rounded-2xl p-8
            bg-neutral-gray/20
            backdrop-blur-xs shadow-xl transition-transform duration-1200 transform ${isRegister ? 'rotate-y-360' : 'rotate-x-0'}
            `}
        >

          <LogoWithText title="Hot" subtitle="Ecomerce" />
          <AuthHeading
            title={isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            subtitle="Bienvenido a"
            highlight="Hot-Ecommerce!"
          /><Button onClick={() => apiRef.current?.focusStore(1.2)}>Ir a la tienda</Button>
            <Button onClick={() => apiRef.current?.focusPlanet(1.2)}>Volver al planeta</Button>

          <CardAuth
            isRegister={isRegister}
            setIsRegister={setIsRegister}
            onSubmitLogin={onSubmitLogin}
            onSubmitRegister={onSubmitRegister}
            isLoading={isRegister ? isLoadingRegister : isLoadingLogin}
          />

          <TermsText />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthContainer;
