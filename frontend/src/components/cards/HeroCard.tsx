import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LotusLogo } from '../ui/LotusLogo';

interface HeroCardProps {
  totalTransactions: number;
  totalCustomers: number;
  totalRevenue: number;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  totalTransactions,
  totalCustomers,
  totalRevenue,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 border border-gold-500/20 text-ivory-100 p-8 sm:p-10 shadow-luxury-lg"
    >
      {/* Visible Lotus Background Motif Watermark */}
      <div className="absolute -bottom-10 -right-10 opacity-15 pointer-events-none text-gold-400">
        <LotusLogo size={280} />
      </div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Left Editorial Narrative */}
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 text-[11px] font-semibold uppercase tracking-widest">
              <LotusLogo className="w-3.5 h-3.5 text-gold-400" />
              Executive Intelligence Suite
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real Database Live
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-ivory-50 leading-[1.15]">
            Business, <span className="gold-sheen italic">understood.</span>
          </h1>

          <p className="text-sm sm:text-base text-ivory-300 font-normal leading-relaxed max-w-xl">
            Samriddh transforms transactions and customer feedback into actionable business intelligence.
            Continuous real-time synthesis of retail velocity, customer loyalty, and sentiment signals.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/app/sam"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-forest-950 font-semibold text-sm transition-all shadow-gold-glow hover:shadow-lg active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-forest-950" />
              <span>Consult SAM Intelligence</span>
              <ArrowRight className="w-4 h-4 text-forest-950" />
            </Link>

            <Link
              to="/app/customers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800/80 hover:bg-forest-700/80 border border-ivory-300/15 text-ivory-100 text-sm font-medium transition-colors"
            >
              <span>Explore RFM Segments</span>
            </Link>
          </div>
        </div>

        {/* Right Verified Metric Badges */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-80 shrink-0">
          <div className="bg-forest-950/60 backdrop-blur-md border border-ivory-300/10 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-gold-400 text-xs font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>Indexed Sales Lines</span>
            </div>
            <p className="text-xl font-bold text-ivory-50 font-mono tracking-tight">
              {totalTransactions.toLocaleString()}
            </p>
            <p className="text-[10px] text-ivory-400 uppercase tracking-wider">Clean Transactions</p>
          </div>

          <div className="bg-forest-950/60 backdrop-blur-md border border-ivory-300/10 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accounts</span>
            </div>
            <p className="text-xl font-bold text-ivory-50 font-mono tracking-tight">
              {totalCustomers.toLocaleString()}
            </p>
            <p className="text-[10px] text-ivory-400 uppercase tracking-wider">Active Customers</p>
          </div>

          <div className="col-span-2 bg-forest-950/60 backdrop-blur-md border border-ivory-300/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gold-300 font-medium">Revenue Pipeline</p>
              <p className="text-xs text-ivory-300 font-mono">£{(totalRevenue / 1_000_000).toFixed(2)}M Gross Sales</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono font-medium border border-emerald-400/20">
              Verified PostgREST
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
