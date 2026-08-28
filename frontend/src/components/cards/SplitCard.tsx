import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Zap } from 'lucide-react';

interface SplitCardProps {
  title: string;
  subtitle: string;
  leftTitle: string;
  leftItems: { label: string; detail: string }[];
  rightTitle: string;
  rightItems: { label: string; detail: string }[];
}

export const SplitCard: React.FC<SplitCardProps> = ({
  title,
  subtitle,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl bg-white border border-ivory-300 p-6 sm:p-7 shadow-luxury"
    >
      <div className="border-b border-ivory-200 pb-4 mb-6">
        <h3 className="text-xl font-serif font-bold text-forest-950">
          {title}
        </h3>
        <p className="text-xs text-forest-600 mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column: Strengths / Anchors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
              {leftTitle}
            </h4>
          </div>

          <div className="space-y-3">
            {leftItems.map((item, i) => (
              <div key={i} className="bg-ivory-50 rounded-lg p-3 border border-ivory-200">
                <p className="text-xs font-bold text-forest-950 font-serif">
                  {item.label}
                </p>
                <p className="text-xs text-forest-700 mt-0.5 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Watch Items / Levers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Zap className="w-4 h-4 text-gold-600" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-900">
              {rightTitle}
            </h4>
          </div>

          <div className="space-y-3">
            {rightItems.map((item, i) => (
              <div key={i} className="bg-gold-50/40 rounded-lg p-3 border border-gold-200/60">
                <p className="text-xs font-bold text-gold-950 font-serif">
                  {item.label}
                </p>
                <p className="text-xs text-forest-800 mt-0.5 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
