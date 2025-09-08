import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';
import Button from '@atoms/button/SimpleButton';
import Icon from '@atoms/icon/SimpleIcon';
import LogoWithText from '@molecules/common/LogoWithText';
import MonthSelector from '@molecules/common/MonthSelector';
const DashboardHeader = ({ role }: { role: string }) => {
  return (
    <Box className='px-2 w-full flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-10'>
      <Box className='text-left'>
        <Box className='block md:hidden mb-5'>
          <LogoWithText title='Hot-Ecomerce' subtitle='Ecomerce' size='sm' />
        </Box>
        <Typography
          variant='h1'
          className='text-xl sm:text-2xl lg:text-3xl font-semibold mb-3'
        >
          {role} <span className='text-primary'>Hot!</span>
        </Typography>
        <Typography
          variant='h1'
          className='text-2xl sm:text-3xl lg:text-4xl font-semibold'
        >
          Bienvenido a tu tienda
        </Typography>
      </Box>
      <Box className='mt-6 lg:mt-0 flex flex-col items-start'>
        <Typography variant='p' className='text-md mb-2 lg:mb-3 text-left'>
          Acciones
        </Typography>
        <Box className='flex flex-row-reverse md:flex-nowrap gap-3 w-full'>
          <Button
            title='Descargar Historial'
            size='sm'
            fullWidth
            className=''
            leftIcon={<Icon name='bx-download' />}
          >
            Descargar Historial
          </Button>

          <MonthSelector />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
