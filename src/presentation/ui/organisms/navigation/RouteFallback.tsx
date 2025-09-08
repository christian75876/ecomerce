import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';
import LogoWithText from '@/presentation/ui/molecules/common/LogoWithText';

const RouteFallback = () => {
  const [dotCount, setDotCount] = useState(0);

  // Evita la recreación innecesaria del intervalo
  const updateDots = useCallback(() => {
    setDotCount((prev) => (prev < 3 ? prev + 1 : 0));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateDots, 500);
    return () => clearInterval(interval);
  }, [updateDots]);

  const dots = useMemo(() => '.'.repeat(dotCount), [dotCount]);

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen text-neutral-dark">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -20, 0, -15, 0, -10, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'easeInOut',
        }}
      >
        <LogoWithText title="Hot" subtitle="Ecomerce" />
      </motion.div>

      {/* Texto optimizado */}
      <Box className="relative mt-4 w-100 text-center">
        <Typography variant="p" className="text-lg font-semibold">
          Cargando, por favor espera {' '}
          <span className="inline-block w-6 text-left">{dots}</span>
        </Typography>
      </Box>
    </Box>
  );
};

export default RouteFallback;