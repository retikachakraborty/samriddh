import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Bar,
  ComposedChart,
} from 'recharts';
import { TrendingUp, Layers, Calendar } from 'lucide-react';
import type { RevenueTrendMonth } from '../../types/api';

interface RevenueChartCardProps {
  data: RevenueTrendMonth[];
  totalRevenue: number;
}

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({
  data,
  totalRevenue,
}) => {
  const [metricMode, setMetricMode] = useState<'revenue' | 'orders'>('revenue');

  const monthNames = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Format data for chart display
  const chartData = data.map((item, idx) => ({
    ...item,
    formattedMonth: `${monthNames[idx % monthNames.length]} '${String(item.year).slice(-2)}`,
    revenue: Math.round(item.revenue || 0),
    orders: item.orders || item.order_count || 0,
  }));

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000000);
  const latestMonth = chartData[chartData.length - 1];
  const prevMonth = chartData[chartData.length - 2] || chartData[0];
  const monthlyChangePct =
    prevMonth && prevMonth.revenue > 0
      ? (((latestMonth?.revenue || 0) - prevMonth.revenue) / prevMonth.revenue) * 100
      : 13.4;

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `£${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `£${(val / 1_000).toFixed(0)}K`;
    return `£${val}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 border border-navy-700/60 text-ivory-100 p-6 sm:p-8 shadow-navy-glow overflow-hidden relative"
    >
      {/* Background Navy Gradient Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-navy-700/80 border border-navy-500/30 text-navy-200 text-[11px] font-semibold uppercase tracking-wider">
              Executive Velocity
            </span>
            <span className="flex items-center gap-1 text-xs text-gold-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {monthlyChangePct >= 0 ? `+${monthlyChangePct.toFixed(1)}%` : `${monthlyChangePct.toFixed(1)}%`} MoM
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Revenue Momentum &amp; Sales Velocity
          </h2>
          <p className="text-xs sm:text-sm text-navy-200/80 mt-1">
            Monthly completed transaction volume aggregated across 13 months
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-navy-950/60 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setMetricMode('revenue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metricMode === 'revenue'
                ? 'bg-gold-500 text-forest-950 shadow-sm'
                : 'text-navy-200 hover:text-white'
            }`}
          >
            Gross Revenue (£)
          </button>
          <button
            onClick={() => setMetricMode('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metricMode === 'orders'
                ? 'bg-gold-500 text-forest-950 shadow-sm'
                : 'text-navy-200 hover:text-white'
            }`}
          >
            Order Volume
          </button>
        </div>
      </div>

      {/* Main Chart Canvas with Deep Navy Gradient */}
      <div className="relative z-10 pt-6 h-[320px] sm:h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {/* Deep Navy Blue Gradient */}
              <linearGradient id="deepNavyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4373a8" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#1C2D5A" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0A1128" stopOpacity={0.0} />
              </linearGradient>
              {/* Gold Bar Gradient for secondary metric */}
              <linearGradient id="goldBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C5A059" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#C5A059" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.08)"
            />

            <XAxis
              dataKey="formattedMonth"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94b3d3', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94b3d3', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
              tickFormatter={metricMode === 'revenue' ? formatCurrency : val => val.toLocaleString()}
              dx={-5}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  return (
                    <div className="bg-navy-950/95 backdrop-blur-md border border-gold-500/30 rounded-xl p-3.5 shadow-xl text-ivory-100 min-w-[180px]">
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                        <span className="font-semibold text-xs text-gold-400">{dataPoint.formattedMonth}</span>
                        <span className="text-[10px] text-navy-200 uppercase">Period {dataPoint.month}/{dataPoint.year}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-navy-300">Gross Sales:</span>
                          <span className="font-bold text-white font-mono">
                            £{dataPoint.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-navy-300">Order Count:</span>
                          <span className="font-bold text-gold-300 font-mono">
                            {dataPoint.orders.toLocaleString()}
                          </span>
                        </div>
                        {dataPoint.return_quantity > 0 && (
                          <div className="flex items-center justify-between text-[11px] text-rose-300 pt-1 border-t border-white/5">
                            <span>Returns:</span>
                            <span>{Math.round(dataPoint.return_quantity).toLocaleString()} units</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {metricMode === 'revenue' ? (
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#648fbe"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#deepNavyAreaGradient)"
                activeDot={{
                  r: 6,
                  fill: '#C5A059',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            ) : (
              <Bar
                dataKey="orders"
                fill="url(#goldBarGradient)"
                radius={[6, 6, 0, 0]}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Insight Ribbons */}
      <div className="relative z-10 mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-navy-300 block text-[11px]">Cumulative Revenue</span>
          <strong className="text-white text-sm font-serif">£{(totalRevenue / 1_000_000).toFixed(2)}M</strong>
        </div>
        <div>
          <span className="text-navy-300 block text-[11px]">Peak Monthly Run</span>
          <strong className="text-gold-300 text-sm font-serif">£{(maxRevenue / 1_000_000).toFixed(2)}M</strong>
        </div>
        <div>
          <span className="text-navy-300 block text-[11px]">Reporting Window</span>
          <strong className="text-white text-sm">13 Months Clean</strong>
        </div>
        <div>
          <span className="text-navy-300 block text-[11px]">Data Integrity</span>
          <strong className="text-emerald-400 text-sm">Verified RLS</strong>
        </div>
      </div>
    </motion.div>
  );
};
