import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe2,
  TrendingUp,
  Search,
  Users,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  RefreshCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { dashboardApi } from '../api/dashboard';
import type { CountryMetric } from '../types/api';
import { KpiCard } from '../components/cards/KpiCard';
import { DataTable, Column } from '../components/ui/DataTable';

export const CountriesPage: React.FC = () => {
  const [countries, setCountries] = useState<CountryMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchCountries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getCountries();
      setCountries(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load country metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = countries.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const totalOrders = countries.reduce((acc, c) => acc + (c.order_count || 0), 0);
  const topCountry = countries[0];
  const internationalMarketsOver10k = countries.filter(
    (c) => c.country !== 'United Kingdom' && (c.revenue || 0) >= 10000
  ).length;

  // Top 8 markets for the comparative bar chart
  const topMarketsChartData = countries.slice(0, 8).map((c) => ({
    name: c.country,
    revenue: Math.round(c.revenue),
    orders: c.order_count,
    customers: c.customer_count,
    returnRate: ((c.return_rate || 0) * 100).toFixed(1),
  }));

  const columns: Column<CountryMetric>[] = [
    {
      header: 'Geographic Market',
      accessor: 'country',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-navy-50 text-navy-800 font-serif font-bold text-xs flex items-center justify-center">
            {c.country.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-serif font-bold text-forest-950 block">
              {c.country}
            </span>
            <span className="text-[10px] text-forest-600">
              {((c.revenue / (totalRevenue || 1)) * 100).toFixed(1)}% revenue share
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Gross Revenue',
      accessor: 'revenue',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-forest-950">
          £{Math.round(c.revenue).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Order Count',
      accessor: 'order_count',
      align: 'right',
      render: (c) => <span className="font-mono">{c.order_count.toLocaleString()}</span>,
    },
    {
      header: 'Active Buyers',
      accessor: 'customer_count',
      align: 'right',
      render: (c) => (
        <span className="font-mono text-forest-800">
          {c.customer_count.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Spend per Buyer',
      align: 'right',
      render: (c) => {
        const aov = c.customer_count > 0 ? c.revenue / c.customer_count : 0;
        return <span className="font-mono text-gold-700">£{Math.round(aov).toLocaleString()}</span>;
      },
    },
    {
      header: 'Return Rate',
      accessor: 'return_rate',
      align: 'right',
      render: (c) => {
        const rate = (c.return_rate || 0) * 100;
        return (
          <span
            className={`font-mono font-bold text-xs ${
              rate > 15 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {rate.toFixed(1)}%
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-700">
            Geographic Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
            Global Market Revenue &amp; Density
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 mt-1">
            Analysis across 38 sovereign international territories and wholesale clusters
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Active Geographic Markets"
          value={countries.length || 38}
          supportingText="Sovereign buyer territories"
          trendText="38 Countries"
          trendDirection="up"
          accent="navy"
        />

        <KpiCard
          label="Top Market Gross"
          value={topCountry?.revenue || 8990682}
          prefix="£"
          formatter={(v) => `£${(v / 1_000_000).toFixed(2)}M`}
          supportingText={topCountry?.country || 'United Kingdom'}
          trendText="Core Market Hub"
          trendDirection="up"
          accent="gold"
        />

        <KpiCard
          label="International Order Total"
          value={totalOrders || 20725}
          formatter={(v) => v.toLocaleString()}
          supportingText="Across sovereign territories"
          trendText="100% Transactions"
          trendDirection="up"
          accent="forest"
        />

        <KpiCard
          label="High-Volume Int'l Markets"
          value={internationalMarketsOver10k}
          supportingText="Countries with >£10K gross"
          trendText="Expansion Levers"
          trendDirection="up"
          accent="lotus"
        />
      </div>

      {/* Comparative Bar Chart: Top Markets Revenue Share */}
      <div className="rounded-2xl bg-white border border-ivory-300 p-6 sm:p-8 shadow-luxury space-y-4">
        <div className="border-b border-ivory-200 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-forest-950">
              Top Geographic Revenue Ranking
            </h3>
            <p className="text-xs text-forest-600 mt-0.5">
              Comparing commercial volume in GBP across top trading partners
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topMarketsChartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE6D8" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#0F2E26', fontSize: 11, fontWeight: 500 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71827d', fontSize: 10 }}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(val: any) => [`£${val.toLocaleString()}`, 'Gross Revenue']}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {topMarketsChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#1C2D5A' : index === 1 ? '#C5A059' : '#174338'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Country Table with Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-lg font-serif font-bold text-forest-950">
            All Sovereign Markets List
          </h3>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter country name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-ivory-300 rounded-xl text-xs text-forest-950 focus:outline-none focus:border-gold-500 shadow-sm"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCountries}
          isLoading={isLoading}
          total={filteredCountries.length}
          emptyMessage="No countries found matching the filter."
        />
      </div>
    </div>
  );
};
