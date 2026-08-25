import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '@atoms/card/SimpleCard';
import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';

const copAxisTick = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    notation: 'compact',
  }).format(value);

const copTooltipFormatter = (value: number) => [formatCurrencyCOP(value), undefined];
import {
  IDashboardChannelComparison,
  IDashboardInventoryFlowPoint,
  IDashboardSalesPoint,
  IDashboardTopCategory,
  IDashboardTopProduct,
} from '@/application/dtos/dashboard/response/DashboardResponse';

const palette = ['#ff6b35', '#0e9594', '#e93e7d', '#ffc93c', '#0369a1', '#7a1740'];

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <Card className='h-full overflow-hidden p-4 sm:p-6'>
    <Typography variant='h3'>{title}</Typography>
    <Typography className='mt-1 text-sm text-neutral-dark/60'>{subtitle}</Typography>
    <Box className='mt-6 h-72 w-full sm:h-80'>{children}</Box>
  </Card>
);

export const SalesOverviewChart = ({ data }: { data: IDashboardSalesPoint[] }) => (
  <ChartCard
    title='Ventas por período'
    subtitle='Compara la evolución diaria del canal POS y online en el rango filtrado.'
  >
    <ResponsiveContainer width='100%' height='100%'>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
        <defs>
          <linearGradient id='salesTotalGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#ff6b35' stopOpacity={0.35} />
            <stop offset='95%' stopColor='#ff6b35' stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis dataKey='label' tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={copAxisTick} width={48} />
        <Tooltip formatter={copTooltipFormatter} />
        <Legend />
        <Area type='monotone' dataKey='total' stroke='#ff6b35' fill='url(#salesTotalGradient)' strokeWidth={3} name='Total' />
        <Area type='monotone' dataKey='pos' stroke='#0e9594' fillOpacity={0} strokeWidth={2} name='POS' />
        <Area type='monotone' dataKey='online' stroke='#0369a1' fillOpacity={0} strokeWidth={2} name='Online' />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const TopProductsChart = ({ data }: { data: IDashboardTopProduct[] }) => (
  <ChartCard
    title='Top productos'
    subtitle='Productos con mayor facturación combinando ventas POS y pedidos online.'
  >
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart data={data} layout='vertical' margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis type='number' tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={copAxisTick} width={80} />
        <YAxis
          type='category'
          dataKey='name'
          width={120}
          tick={{ fill: '#475569', fontSize: 12 }}
        />
        <Tooltip formatter={copTooltipFormatter} />
        <Bar dataKey='revenue' radius={[0, 8, 8, 0]} fill='#ff6b35' />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const CategoryMixChart = ({ data }: { data: IDashboardTopCategory[] }) => (
  <ChartCard
    title='Top categorías'
    subtitle='Participación de categorías según ingresos dentro del período.'
  >
    <ResponsiveContainer width='100%' height='100%'>
      <PieChart>
        <Pie
          data={data}
          dataKey='revenue'
          nameKey='name'
          cx='50%'
          cy='50%'
          innerRadius={65}
          outerRadius={105}
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={entry.categoryId} fill={palette[index % palette.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const ChannelComparisonChart = ({
  data,
}: {
  data: IDashboardChannelComparison[];
}) => (
  <ChartCard
    title='Comparación por canal'
    subtitle='Contrasta volumen y facturación entre operación presencial y online.'
  >
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis dataKey='channel' tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis yAxisId='left' tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={copAxisTick} width={48} />
        <YAxis yAxisId='right' orientation='right' tick={{ fill: '#0369a1', fontSize: 12 }} width={28} />
        <Tooltip
          formatter={(value: number, name: string) =>
            name === 'Operaciones' ? [value, name] : [formatCurrencyCOP(value), name]
          }
        />
        <Legend />
        <Bar yAxisId='left' dataKey='revenue' fill='#0e9594' radius={[8, 8, 0, 0]} name='Ingresos' />
        <Bar yAxisId='right' dataKey='count' fill='#0369a1' radius={[8, 8, 0, 0]} name='Operaciones' />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const InventoryFlowChart = ({
  data,
}: {
  data: IDashboardInventoryFlowPoint[];
}) => (
  <ChartCard
    title='Flujo de inventario'
    subtitle='Entradas y salidas del inventario con saldo neto dentro del rango.'
  >
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis dataKey='label' tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey='inbound' fill='#0e9594' radius={[8, 8, 0, 0]} name='Entradas' />
        <Bar dataKey='outbound' fill='#dc2626' radius={[8, 8, 0, 0]} name='Salidas' />
        <Bar dataKey='net' fill='#ff6b35' radius={[8, 8, 0, 0]} name='Neto' />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);
