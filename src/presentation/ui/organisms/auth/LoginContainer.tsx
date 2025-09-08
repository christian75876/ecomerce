import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import Box from '@atoms/box/SimpleBox';
import AuthFormLogin from '@molecules/auth/AuthFormLogin';
import AuthHeading from '@molecules/auth/AuthHeading';
import TermsText from '@molecules/auth/TermsTextLogin';
import LogoWithText from '@/presentation/ui/molecules/common/LogoWithText';
import { useLogin } from '@/application/useCases/auth/useLogin';
import ThreeRoot from '../../three/scenes/ThreeRoot';

const LoginCointainer = () => {
  const { isloading, handleLogin } = useLogin();
  const onSubmit = (data: ILoginRequest) => handleLogin(data);

  return (
    <Box className="relative min-h-screen">
      <Box className="absolute inset-0 z-0">
        <ThreeRoot />
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
          className="
            pointer-events-auto
            w-full max-w-md rounded-2xl p-8
            backdrop-blur-xs shadow-xl
          "
        >
          <LogoWithText title="Hot" subtitle="Ecomerce" />
          <AuthHeading
            title="Iniciar sesión"
            subtitle="Bienvenido a"
            highlight="Hot-Ecomerce!"
          />
          <AuthFormLogin onSubmit={onSubmit} isLoading={isloading} />
          <TermsText />
        </Box>
      </Box>
    </Box>
  );
};

export default LoginCointainer;
