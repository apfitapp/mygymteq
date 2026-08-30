import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'wide';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const maxWidthClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-full',
  }[variant];

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col gap-6 w-full ${maxWidthClasses} mx-auto ${className}`}
    >
      {children}
    </motion.div>
  );
};

