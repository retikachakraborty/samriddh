import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export interface RankedItem {
  id: string;
  title: string;
  subtitle?: string;
  metricLabel: string;
  metricValue: number;
  percentageOfMax: number;
  badge?: string;
  badgeTone?: 'emerald' | 'gold' | 'rose' | 'navy';
}

interface RankedListCardProps {
  title: string;
  subtitle: string;
  items: RankedItem[];
  viewAllLink?: string;
  onItemClick?: (item: RankedItem) => void;
}

export const RankedListCard: React.FC<RankedListCardProps> = ({
  title,
  subtitle,
  items,
  onItemClick,
}) => {
  return (
    <div className="rounded-xl bg-white border border-ivory-300 p-6 shadow-luxury flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-ivory-200">
          <div>
            <h3 className="text-lg font-serif font-bold text-forest-950">
              {title}
            </h3>
            <p className="text-xs text-forest-600 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="space-y-3.5">
          {items.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => onItemClick && onItemClick(item)}
              className={`group flex flex-col gap-1.5 p-2.5 rounded-lg hover:bg-ivory-100/70 transition-colors ${
                onItemClick ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 max-w-[70%]">
                  <span className="w-5 h-5 rounded-full bg-forest-900/5 text-forest-900 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-forest-900 truncate group-hover:text-gold-700 transition-colors">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-ivory-200 text-forest-700 uppercase">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono font-bold text-forest-950 shrink-0">
                  <span>{item.metricLabel}</span>
                  {onItemClick && (
                    <ArrowUpRight className="w-3 h-3 text-forest-400 group-hover:text-gold-600 transition-colors" />
                  )}
                </div>
              </div>

              {/* Progress Bar indicator */}
              <div className="w-full h-1.5 bg-ivory-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(8, item.percentageOfMax))}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.06 }}
                  className={`h-full rounded-full ${
                    idx === 0 ? 'bg-gold-500' : idx === 1 ? 'bg-forest-800' : 'bg-forest-600/70'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
