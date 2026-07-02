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
import {
  IDashboardChannelComparison,
  IDashboardInventoryFlowPoint,
  IDashboardSalesPoint,
  IDashboardTopCategory,
  IDashboardTopProduct,
} from '@/application/dtos/dashboard/response/DashboardResponse';

const palette = ['#f97316', '#0f766e', '#1d4ed8', '#eab308', '#8b5cf6', '#ef4444'];

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <Card className='h-full p-6'>
    <Typography variant='h3'>{title}</Typography>
    <Typography className='mt-1 text-sm text-neutral-dark/60'>{subtitle}</Typography>
    <Box className='mt-6 h-80 w-full'>{children}</Box>
  </Card>
);

export const SalesOverviewChart = ({ data }: { data: IDashboardSalesPoint[] }) => (
  <ChartCard
    title='Ventas por período'
    subtitle='Compara la evolución diaria del canal POS y online en el rango filtrado.'
  >
    <ResponsiveContainer width='100%' height='100%'>
      <AreaChart data={data}>
        <defs>
          <linearGradient id='salesTotalGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#f97316' stopOpacity={0.35} />
            <stop offset='95%' stopColor='#f97316' stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis dataKey='label' tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Area type='monotone' dataKey='total' stroke='#f97316' fill='url(#salesTotalGradient)' strokeWidth={3} name='Total' />
        <Area type='monotone' dataKey='pos' stroke='#0f766e' fillOpacity={0} strokeWidth={2} name='POS' />
        <Area type='monotone' dataKey='online' stroke='#1d4ed8' fillOpacity={0} strokeWidth={2} name='Online' />
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
        <XAxis type='number' tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis
          type='category'
          dataKey='name'
          width={120}
          tick={{ fill: '#475569', fontSize: 12 }}
        />
        <Tooltip />
        <Bar dataKey='revenue' radius={[0, 8, 8, 0]} fill='#f97316' />
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
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
        <XAxis dataKey='channel' tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey='revenue' fill='#0f766e' radius={[8, 8, 0, 0]} name='Ingresos' />
        <Bar dataKey='count' fill='#1d4ed8' radius={[8, 8, 0, 0]} name='Operaciones' />
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
        <Bar dataKey='inbound' fill='#0f766e' radius={[8, 8, 0, 0]} name='Entradas' />
        <Bar dataKey='outbound' fill='#ef4444' radius={[8, 8, 0, 0]} name='Salidas' />
        <Bar dataKey='net' fill='#f97316' radius={[8, 8, 0, 0]} name='Neto' />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);
