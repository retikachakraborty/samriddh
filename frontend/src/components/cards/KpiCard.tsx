import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatter?: (val: number) => string;
  supportingText: string;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  accent?: 'forest' | 'gold' | 'navy' | 'lotus';
  sparklineData?: number[];
  onClick?: () => void;
  index?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  formatter,
  supportingText,
  trendText,
  trendDirection = 'up',
  accent = 'forest',
  sparklineData,
  onClick,
  index = 0,
}) => {
  const accentBorder = {
    forest: 'hover:border-forest-600/40 border-forest-900/10',
    gold: 'hover:border-gold-500/50 border-gold-400/20',
    navy: 'hover:border-navy-600/40 border-navy-900/10',
    lotus: 'hover:border-lotus-500/40 border-lotus-200',
  }[accent];

  const accentTopBar = {
    forest: 'bg-forest-800',
    gold: 'bg-gold-500',
    navy: 'bg-navy-800',
    lotus: 'bg-lotus-500',
  }[accent];

  // SVG sparkline path calculation if data is provided
  let points = '';
  const width = 100;
  const height = 30;
  if (sparklineData && sparklineData.length > 1) {
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    points = sparklineData
      .map((val, i) => {
        const x = (i / (sparklineData.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl bg-white border ${accentBorder} p-5 sm:p-6 shadow-luxury transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top Accent Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentTopBar}`} />

      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
          {label}
        </span>
        {onClick && (
          <ArrowUpRight className="w-4 h-4 text-forest-400 group-hover:text-forest-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 tracking-tight">
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            formatter={formatter}
          />
        </div>

        {/* Real Sparkline visualization if provided */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="w-24 h-8 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke={accent === 'gold' ? '#C5A059' : accent === 'lotus' ? '#D9778F' : '#174338'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="text-forest-600 font-normal truncate">
          {supportingText}
        </span>

        {trendText && (
          <span
            className={`inline-flex items-center gap-1 font-semibold shrink-0 ${
              trendDirection === 'up'
                ? 'text-emerald-700'
                : trendDirection === 'down'
                ? 'text-rose-700'
                : 'text-forest-700'
            }`}
          >
            {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            {trendText}
          </span>
        )}
      </div>
    </motion.div>
  );
};
