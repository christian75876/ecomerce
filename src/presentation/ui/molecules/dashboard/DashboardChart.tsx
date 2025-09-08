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

const DashboardChart = () => {
  //TODO: Fetch Stats Chart
  const data = [
    { year: '2016', value: 5000 },
    { year: '2017', value: 15000 },
    { year: '2018', value: 30000 },
    { year: '2019', value: 50000 },
    { year: '2020', value: 10000 },
    { year: '2021', value: 30000 },
    { year: '2022', value: 50000 },
    { year: '2023', value: 70000 }
  ];

  return (
    <Card className='p-6 w-full h-full'>
      <Box className='flex justify-between items-center mb-4'>
        <Typography variant='h3' className='font-semibold text-3xl text-gray-900 mb-5'>
          Incremento de Envíos
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
