import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

export interface InsightCardProps {
  title: string;
  kind: 'Risk' | 'Opportunity' | 'Positive Signal' | 'Retention Alert';
  metric: string;
  detail: string;
  action: string;
  index?: number;
  onOpen?: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  kind,
  metric,
  detail,
  action,
  index = 0,
  onOpen,
}) => {
  const kindConfig = {
    Risk: {
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      topBorder: 'bg-rose-500',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
    },
    Opportunity: {
      badgeBg: 'bg-gold-50 text-gold-900 border-gold-300',
      topBorder: 'bg-gold-500',
      icon: <Sparkles className="w-3.5 h-3.5 text-gold-600" />,
    },
    'Positive Signal': {
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      topBorder: 'bg-emerald-600',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    'Retention Alert': {
      badgeBg: 'bg-navy-50 text-navy-800 border-navy-200',
      topBorder: 'bg-navy-700',
      icon: <TrendingUp className="w-3.5 h-3.5 text-navy-600" />,
    },
  }[kind] || {
    badgeBg: 'bg-forest-50 text-forest-800 border-forest-200',
    topBorder: 'bg-forest-700',
    icon: <Sparkles className="w-3.5 h-3.5 text-forest-600" />,
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onOpen}
      className="group relative rounded-xl bg-white border border-ivory-300 p-6 shadow-luxury hover:border-gold-400/40 hover:shadow-luxury-lg transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Top Accent Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${kindConfig.topBorder}`} />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${kindConfig.badgeBg}`}
          >
            {kindConfig.icon}
            <span>{kind}</span>
          </span>
          <span className="font-serif font-bold text-sm text-forest-900 font-mono">
            {metric}
          </span>
        </div>

        <h3 className="text-base font-serif font-bold text-forest-950 group-hover:text-gold-700 transition-colors leading-snug">
          {title}
        </h3>

        <p className="text-xs text-forest-700 font-normal leading-relaxed mt-2 line-clamp-3">
          {detail}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-ivory-200 flex items-center justify-between text-xs">
        <span className="text-forest-600 text-[11px] truncate max-w-[200px]">
          Action: {action}
        </span>
        <span className="inline-flex items-center gap-1 text-gold-700 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0">
          <span>Read finding</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.article>
  );
};
