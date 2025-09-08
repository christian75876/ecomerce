import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from "react-day-picker/locale";


import Box from '@atoms/box/SimpleBox';
import Button from '@atoms/button/SimpleButton';
import Icon from '@atoms/icon/SimpleIcon';

const MonthSelector = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(
    new Date()
  );

  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month);
    setShowCalendar(false);
  };

  return (
    <Box className='relative'>
      {/* Botón para abrir el calendario */}
      <Button
        title='Seleccionar Fecha'
        size='sm'
        variant='ghost'
        leftIcon={<Icon name='bx-calendar' />}
        onClick={() => setShowCalendar(prev => !prev)}
      >
        {selectedMonth?.toLocaleString('es-ES', {
          month: 'long',
          year: 'numeric'
        })}
      </Button>

      {/* Calendario flotante */}
      {showCalendar && (
        <Box className='absolute left-0 mt-2 bg-white p-4 rounded-lg shadow-lg z-50'>
          <DayPicker
            mode='single'
            selected={selectedMonth}
            onMonthChange={handleMonthChange}
            captionLayout='dropdown'
            classNames={{
              caption: 'text-primary font-semibold',
              head_row: 'text-primary',
              cell: 'hover:bg-primary-light rounded-md',
              day_selected: 'bg-primary text-white rounded-full',
              day_today: 'border border-primary text-primary font-bold'
            }}
            locale={es}
            timeZone='America/Bogota' // Fijar timezone a Bogotá
          />
        </Box>
      )}
    </Box>
  );
};

export default MonthSelector;
