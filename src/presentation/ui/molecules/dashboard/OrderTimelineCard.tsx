import Box from '@atoms/box/SimpleBox';
import Card from '@atoms/card/SimpleCard';
import Typography from '@atoms/typography/SimpleTypography';
import Timeline, { TimelineStep } from '@molecules/common/Timeline';
import Button from '@atoms/button/SimpleButton';
import Link from '@atoms/link/Simplelink';
import Icon from '@atoms/icon/SimpleIcon';
import SimpleHr from '@atoms/hr/SimpleHr';

interface OrderTimelineCardProps {
  orderId: string;
  statusList: TimelineStep[];
  onUpdateStatus?: () => void;
}

const OrderTimelineCard = ({
  orderId,
  statusList,
  onUpdateStatus
}: OrderTimelineCardProps) => {
  return (
    <Card className='flex flex-col p-6 space-y-4 w-full h-full'>
      {/* 🔹 Título y Enlace */}
      <Box className='flex justify-between items-center'>
        <Typography
          variant='h3'
          className='font-semibold text-3xl text-gray-900'
        >
          Último envío
        </Typography>
        <Link
          to='#'
          className='text-primary text-sm font-medium hover:underline'
        >
          Ver todos
        </Link>
      </Box>

      <SimpleHr width='100%' />

      {/* 🔹 Número de orden */}
      <Box className='mb-10'>
        <Typography className='text-gray-600 text-lg font-semibold'>
          Número de envío:
        </Typography>
        <Typography className='text-md'>{orderId}</Typography>
      </Box>

      {/* 🔹 Línea de tiempo */}
      <Timeline steps={statusList} />

      {/* 🔹 Botón de actualización */}
      <Button
        variant='primary'
        className='mt-5'
        fullWidth
        onClick={onUpdateStatus}
        rightIcon={<Icon name='bx-right-arrow-alt pt-1' />}
      >
        Actualizar estado
      </Button>
    </Card>
  );
};

export default OrderTimelineCard;
