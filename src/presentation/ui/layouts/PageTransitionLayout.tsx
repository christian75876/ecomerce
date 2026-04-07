import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransitionLayout = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransitionLayout;
