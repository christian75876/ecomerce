// /presentation/ui/containers/auth/AuthContainer.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@atoms/box/SimpleBox';
import AuthHeading from '@molecules/auth/AuthHeading';
import TermsText from '@molecules/auth/TermsTextLogin';
import LogoWithText from '@/presentation/ui/molecules/common/LogoWithText';
import ThreeRoot from '../../three/scenes/ThreeRoot';
import CardAuth from '@/presentation/ui/molecules/auth/CardAuth';
import { useLogin } from '@/application/useCases/auth/useLogin';
import { useRegister } from '@/application/useCases/auth/useRegister';
import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import { IRegisterForm } from '@/application/dtos/auth/register/register/RegisterRequest';

const AuthContainer = () => {
  const [isRegister, setIsRegister] = useState(false);
  const { isloading: isLoadingLogin, handleLogin } = useLogin();
  const { isloadingRegister: isLoadingRegister, handleRegister } = useRegister();

  const onSubmitRegister = async (form: IRegisterForm, faceVectors: number[][]) => {
    await handleRegister(form, faceVectors); // ⬅️ un paso
  };

  const onSubmitLogin = (data: ILoginRequest) => handleLogin(data);

  const apiRef = useRef<{ focusStore: (d?: number) => void; focusPlanet: (d?: number) => void } | null>(null);
  const handleThreeReady = useCallback((api: { focusStore: (d?: number) => void; focusPlanet: (d?: number) => void }) => {
    apiRef.current = api;
  }, []);
  useEffect(() => {
  const api = apiRef.current;
  if (!api) return;

  if (isRegister) {
    api.focusStore(1.2);
  } else {
    api.focusPlanet(1.2);
  }
}, [isRegister]);

  return (
    <Box className="relative min-h-screen">
      <Box className="absolute inset-0 z-0">
        <ThreeRoot onReady={handleThreeReady} />
      </Box>
      <Box className="pointer-events-none absolute inset-0 z-10 grid place-items-center lg:grid-cols-[1fr_auto] lg:gap-12 px-6 lg:mr-18">
        <div className="hidden lg:block" />
        <Box className="pointer-events-auto w-full max-w-md rounded-2xl p-8 bg-neutral-gray/20 backdrop-blur-xs shadow-xl transition-transform duration-1200 transform">
          <LogoWithText title="Hot" subtitle="Ecomerce" />
          <AuthHeading
            title={isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            subtitle="Bienvenido a"
            highlight="Hot-Ecommerce!"
          />
          <CardAuth
            isRegister={isRegister}
            setIsRegister={setIsRegister}
            onSubmitLogin={onSubmitLogin}
            onSubmitRegister={onSubmitRegister}   // ⬅️ ahora recibe (form, vectors)
            isLoading={isRegister ? isLoadingRegister : isLoadingLogin}
          />
          <TermsText />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthContainer;
