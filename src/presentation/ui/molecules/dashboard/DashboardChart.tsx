import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line
} from 'recharts';

import Box from '@atoms/box/SimpleBox';
import Card from '@atoms/card/SimpleCard';
import Typography from '@atoms/typography/SimpleTypography';

const DashboardChart = ({
  salesByDay,
}: {
  salesByDay: Array<{ label: string; total: number }>;
}) => {
  const data = salesByDay.map((item) => ({
    year: item.label,
    value: item.total,
  }));

  return (
    <Card className='p-6 w-full h-full'>
      <Box className='flex justify-between items-center mb-4'>
        <Typography variant='h3' className='font-semibold text-3xl text-gray-900 mb-5'>
          Ventas de los últimos 7 días
        </Typography>
      </Box>

      <Box className='w-full h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          >
            <XAxis dataKey='year' tick={{ fill: '#666' }} />
            <YAxis tick={{ fill: '#666' }} />
            <Tooltip />

            <defs>
              <linearGradient id='areaGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#9d53fe' stopOpacity={0.4} />
                <stop offset='100%' stopColor='#9d53fe' stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <Area
              type='monotone'
              dataKey='value'
              stroke='#8884d8'
              strokeDasharray='5 5'
              fill='url(#areaGradient)'
            />

            <Line
              type='monotone'
              dataKey='value'
              strokeWidth={5}
              stroke='#9d53fe'
              strokeDasharray='5 5'
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default DashboardChart;
