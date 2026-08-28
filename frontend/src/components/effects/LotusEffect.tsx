import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LotusLogo } from '../ui/LotusLogo';

export const LotusEffect: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-10 right-10 text-lotus-400/20">
          <LotusLogo size={120} />
        </div>
      </div>
    );
  }

  // 5 elegant lotus petals positioned across page margins
  const petals = [
    { id: 1, left: '5%', top: '12%', size: 42, delay: 0, duration: 16, rotate: 12 },
    { id: 2, left: '88%', top: '18%', size: 48, delay: 2, duration: 20, rotate: -20 },
    { id: 3, left: '94%', top: '62%', size: 36, delay: 1, duration: 18, rotate: 35 },
    { id: 4, left: '3%', top: '78%', size: 44, delay: 3, duration: 22, rotate: -12 },
    { id: 5, left: '46%', top: '5%', size: 32, delay: 1.5, duration: 17, rotate: 25 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute text-lotus-500/30 drop-shadow-[0_4px_16px_rgba(217,119,143,0.25)]"
          style={{
            left: petal.left,
            top: petal.top,
            width: petal.size,
            height: petal.size,
          }}
          animate={{
            y: [0, -20, 10, 0],
            x: [0, 12, -8, 0],
            rotate: [petal.rotate, petal.rotate + 15, petal.rotate - 10, petal.rotate],
            opacity: [0.25, 0.45, 0.3, 0.25],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: petal.delay,
          }}
        >
          <LotusLogo size={petal.size} />
        </motion.div>
      ))}

      {/* Subtle Lotus Soft Pink & Gold Radiance */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-lotus-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gold-200/25 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
