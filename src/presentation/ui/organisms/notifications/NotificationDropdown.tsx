import { useState } from 'react';

import Box from '@atoms/box/SimpleBox';
import Icon from '@atoms/icon/SimpleIcon';
import Typography from '@atoms/typography/SimpleTypography';

import DropdownMenu from '@molecules/common/DropdownMenu';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: 1, message: 'Nuevo pedido recibido', time: 'Hace 2 min', read: false },
  {
    id: 2,
    message: 'Tu envío ha sido actualizado',
    time: 'Hace 1 hora',
    read: true
  },
  {
    id: 3,
    message: 'Stock bajo en un producto',
    time: 'Hace 3 horas',
    read: false
  }
];

const NotificationDropdown = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu
      icon='bx-bell'
      size='sm'
      variant='outline'
      shape='square'
      color='primary'
    >
      <Box className=''>
        {/* Encabezado */}
        <Box className='flex justify-between items-center border-b pb-2 mb-2'>
          <Typography
            variant='p'
            className='text-lg font-semibold text-neutral-dark'
          >
            Notificaciones
          </Typography>
          <button
            onClick={markAllAsRead}
            className='text-sm text-primary hover:underline'
          >
            Marcar todo como leído
          </button>
        </Box>

        {/* Lista de notificaciones */}
        {notifications.length === 0 ? (
          <Typography variant='p' className='text-center text-gray-500 py-2'>
            No tienes notificaciones
          </Typography>
        ) : (
          <Box className='flex flex-col space-y-2'>
            {notifications.map(({ id, message, time, read }) => (
              <Box
                key={id}
                className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  read ? 'bg-gray-100' : 'bg-primary/10'
                }`}
              >
                <Icon
                  name={read ? 'bx-envelope-open' : 'bx-envelope'}
                  className='text-primary text-xl'
                />
                <Box className='flex-1'>
                  <Typography variant='p' className='text-sm text-neutral-dark'>
                    {message}
                  </Typography>
                  <Typography variant='p' className='text-xs text-gray-500'>
                    {time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
