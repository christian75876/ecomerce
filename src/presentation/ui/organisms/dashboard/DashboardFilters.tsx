import Box from '@atoms/box/SimpleBox';
import Button from '@atoms/button/SimpleButton';
import Input from '@atoms/input/SimpleInput';
import Typography from '@atoms/typography/SimpleTypography';
import { IDashboardAnalyticsQuery } from '@/application/dtos/dashboard/response/DashboardResponse';

interface DashboardFiltersProps {
  filters: IDashboardAnalyticsQuery;
  onChange: <K extends keyof IDashboardAnalyticsQuery>(
    key: K,
    value: IDashboardAnalyticsQuery[K],
  ) => void;
  onReset: () => void;
}

const DashboardFilters = ({
  filters,
  onChange,
  onReset,
}: DashboardFiltersProps) => {
  return (
    <Box className='surface-panel rounded-[1.8rem] border border-white/60 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]'>
      <Box className='mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
        <Box>
          <Typography variant='h3'>Período y umbrales</Typography>
          <Typography className='text-sm text-neutral-dark/65'>
            Ajusta el rango de fechas y los umbrales para recalcular KPIs y gráficos.
          </Typography>
        </Box>
        <Box className='flex flex-wrap gap-3'>
          <Button variant='outline' size='sm' onClick={onReset}>
            Restablecer
          </Button>
        </Box>
      </Box>

      <Box className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Box>
          <Typography variant='span' className='mb-2 block text-neutral-dark/70'>
            Desde
          </Typography>
          <Input
            type='date'
            value={filters.startDate ?? ''}
            onChange={(event) => onChange('startDate', event.target.value)}
          />
        </Box>

        <Box>
          <Typography variant='span' className='mb-2 block text-neutral-dark/70'>
            Hasta
          </Typography>
          <Input
            type='date'
            value={filters.endDate ?? ''}
            onChange={(event) => onChange('endDate', event.target.value)}
          />
        </Box>

        <Box>
          <Typography variant='span' className='mb-2 block text-neutral-dark/70'>
            Stock crítico (unidades)
          </Typography>
          <Input
            type='number'
            min={1}
            value={filters.criticalStockThreshold ?? 5}
            onChange={(event) =>
              onChange('criticalStockThreshold', Number(event.target.value) || 1)
            }
          />
        </Box>

        <Box>
          <Typography variant='span' className='mb-2 block text-neutral-dark/70'>
            Días sin rotación
          </Typography>
          <Input
            type='number'
            min={1}
            value={filters.rotationDays ?? 30}
            onChange={(event) =>
              onChange('rotationDays', Number(event.target.value) || 1)
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardFilters;
