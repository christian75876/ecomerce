import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Box from '@atoms/box/SimpleBox';
import Card from '@atoms/card/SimpleCard';
import Icon from '@atoms/icon/SimpleIcon';
import Typography from '@atoms/typography/SimpleTypography';

interface DashboardStatCardProps {
  icon: string;
  title: string;
  value: number;
  trendIcon?: string;
  trendColor?: string;
}

const DashboardStatCard = ({
  icon,
  title,
  value,
  trendIcon,
  trendColor = 'text-gray-500'
}: DashboardStatCardProps) => {
  return (
    <Card className='flex justify-between items-end space-y-2 w-full'>
      <Box className='flex flex-col justify-center'>
        <Box className='flex items-center justify-between'>
          <Icon name={icon} className='text-primary text-2xl' size={32} />
        </Box>
        <Typography variant='p' className='text-gray-500 my-2'>{title}</Typography>

        {/* 🔥 Número Animado */}
        <motion.span
          className='text-gray-900 font-semibold text-3xl'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedCounter value={value} />
        </motion.span>
      </Box>

      <Box>
        {trendIcon && (
          <Icon size={32} name={trendIcon} className={`text-xl ${trendColor} self-end`} />
        )}
      </Box>
    </Card>
  );
};

/** 🎯 Componente de Contador Animado */
const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1.5;
    const interval = 30;
    const steps = (duration * 1000) / interval;
    const increment = value / steps;

    let current = 0;
    const counter = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(counter);
      } else {
        setCount(Math.ceil(current));
      }
    }, interval);

    return () => clearInterval(counter);
  }, [value]);

  return <>{count.toLocaleString()}</>;
};

export default DashboardStatCard;