import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  RefreshCcw,
  Calendar,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Award,
} from 'lucide-react';
import { dashboardApi, CustomerQueryParams } from '../api/dashboard';
import type { Customer, PageResult } from '../types/api';
import { KpiCard } from '../components/cards/KpiCard';
import { DataTable, Column } from '../components/ui/DataTable';
import { Drawer } from '../components/ui/Drawer';

export const CustomersPage: React.FC = () => {
  const [data, setData] = useState<PageResult<Customer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter and Search states
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('');
  const [highValueOnly, setHighValueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: CustomerQueryParams = {
        search: search.trim() || undefined,
        segment: segment || undefined,
        high_value: highValueOnly ? true : undefined,
        page,
        page_size: pageSize,
      };
      const result = await dashboardApi.getCustomers(params);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, segment, highValueOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  // Exact 5 segments in Supabase customers table
  const segmentsList = [
    'Champions',
    'Loyal customers',
    'Inactive',
    'Growing customers',
    'At-risk high value',
  ];

  const columns: Column<Customer>[] = [
    {
      header: 'Customer ID',
      accessor: 'customer_id',
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-forest-900/10 text-forest-900 font-mono font-bold text-xs flex items-center justify-center">
            {c.customer_id.slice(-2)}
          </div>
          <div>
            <span className="font-mono font-bold text-forest-950">#{c.customer_id}</span>
            <span className="text-[11px] text-forest-600 block">{c.country}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'RFM Segment',
      accessor: 'rfm_segment',
      render: (c) => {
        const isChamp = c.rfm_segment === 'Champions';
        const isRisk = c.rfm_segment === 'At-risk high value';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isChamp
                ? 'bg-gold-50 text-gold-900 border-gold-300'
                : isRisk
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-forest-50 text-forest-900 border-forest-200'
            }`}
          >
            {isChamp && <Award className="w-3 h-3 text-gold-600" />}
            {isRisk && <AlertTriangle className="w-3 h-3 text-rose-600" />}
            <span>{c.rfm_segment}</span>
          </span>
        );
      },
    },
    {
      header: 'Total Spend',
      accessor: 'monetary_value',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-forest-950">
          £{Math.round(c.total_spend || c.monetary_value).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Orders',
      accessor: 'order_count',
      align: 'center',
      render: (c) => <span className="font-mono">{c.order_count}</span>,
    },
    {
      header: 'Avg Order Value',
      accessor: 'average_order_value',
      align: 'right',
      render: (c) => (
        <span className="font-mono text-forest-700">
          £{Math.round(c.average_order_value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Last Purchase',
      accessor: 'recency',
      render: (c) => (
        <span className="text-xs text-forest-700">
          {c.recency} days ago
        </span>
      ),
    },
    {
      header: 'RFM Score',
      accessor: 'rfm_score',
      align: 'center',
      render: (c) => (
        <span className="px-2 py-0.5 rounded bg-ivory-200 text-forest-800 font-mono text-xs font-semibold">
          {c.rfm_score || `${c.r_score}${c.f_score}${c.m_score}`}
        </span>
      ),
    },
    {
      header: 'Recommended Action',
      accessor: 'retention_action',
      render: (c) => (
        <span className="text-xs text-gold-800 font-medium truncate max-w-[200px] block">
          {c.retention_action || 'VIP Growth Program'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-700">
            Customer Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
            RFM Segmentation &amp; Lifetime Value
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 mt-1">
            Granular behavioural segmentation across 4,372 verified customer accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHighValueOnly(!highValueOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              highValueOnly
                ? 'bg-gold-500 text-forest-950 border-gold-600 shadow-gold-glow'
                : 'bg-white text-forest-800 border-ivory-300 hover:bg-ivory-100'
            }`}
          >
            {highValueOnly ? '✓ High-Value Accounts Only' : 'Filter High-Value Accounts'}
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Customer Base"
          value={4372}
          formatter={(v) => v.toLocaleString()}
          supportingText="Valid CustomerID records"
          trendText="100% RFM Scored"
          trendDirection="up"
          accent="forest"
        />

        <KpiCard
          label="At-Risk High Value Accounts"
          value={135}
          supportingText="Recency avg 173.2 days"
          trendText="£202.9K Opportunity"
          trendDirection="down"
          accent="lotus"
        />

        <KpiCard
          label="Average Customer Value"
          value={1894}
          prefix="£"
          formatter={(v) => `£${v.toLocaleString()}`}
          supportingText="Mean lifetime revenue"
          trendText="Pareto Distributed"
          trendDirection="up"
          accent="gold"
        />

        <KpiCard
          label="Champions Segment Value"
          value={6021291}
          prefix="£"
          formatter={(v) => `£${(v / 1_000_000).toFixed(2)}M`}
          supportingText="1,022 top tier accounts"
          trendText="72.7% Gross Share"
          trendDirection="up"
          accent="navy"
        />
      </div>

      {/* RFM Distribution Visual Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white border border-gold-500/20 shadow-luxury space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <h3 className="text-sm font-serif font-bold text-ivory-100">
              RFM Behavioural Architecture (4,372 Accounts · £8.28M Lifetime Value)
            </h3>
          </div>
          <span className="text-[11px] text-gold-300 font-mono">Recency · Frequency · Monetary</span>
        </div>

        {/* Visual Segment Bar */}
        <div className="space-y-1.5">
          <div className="h-3 rounded-full overflow-hidden flex bg-forest-800">
            <div style={{ width: '72.7%' }} className="bg-gold-500" title="Champions (£6.02M · 72.7%)" />
            <div style={{ width: '16.2%' }} className="bg-forest-500" title="Loyal customers (£1.34M · 16.2%)" />
            <div style={{ width: '5.5%' }} className="bg-navy-500" title="Inactive (£456K · 5.5%)" />
            <div style={{ width: '3.1%' }} className="bg-emerald-400" title="Growing customers (£260K · 3.1%)" />
            <div style={{ width: '2.5%' }} className="bg-rose-500" title="At-risk high value (£203K · 2.5%)" />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-ivory-300 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold-500" /> Champions (1,022 accounts · £6.02M)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-forest-500" /> Loyal customers (1,029 · £1.34M)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-navy-500" /> Inactive (1,404 · £456K)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> At-risk high value (135 · £203K)
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Segment Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, country, or segment..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-ivory-300 rounded-xl text-xs text-forest-950 focus:outline-none focus:border-gold-500 transition-colors shadow-sm"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={segment}
            onChange={(e) => {
              setSegment(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3.5 py-2 bg-white border border-ivory-300 rounded-xl text-xs text-forest-800 font-medium focus:outline-none focus:border-gold-500 shadow-sm"
          >
            <option value="">All RFM Segments</option>
            {segmentsList.map((seg) => (
              <option key={seg} value={seg}>
                {seg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        total={data?.total || null}
        page={page}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        onRowClick={(customer) => setSelectedCustomer(customer)}
        emptyMessage="No customers found matching the search criteria."
      />

      {/* Customer Detail Drawer */}
      <Drawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={`Account #${selectedCustomer?.customer_id}`}
        subtitle={`Location: ${selectedCustomer?.country || 'International'}`}
        badge={selectedCustomer?.rfm_segment}
        badgeTone={selectedCustomer?.rfm_segment === 'Champions' ? 'gold' : 'forest'}
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-ivory-300 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-semibold block">
                  Lifetime Spend
                </span>
                <span className="text-xl font-serif font-bold text-forest-950 font-mono mt-1 block">
                  £{Math.round(selectedCustomer.total_spend || selectedCustomer.monetary_value).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-300 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-semibold block">
                  Orders Placed
                </span>
                <span className="text-xl font-serif font-bold text-forest-950 font-mono mt-1 block">
                  {selectedCustomer.order_count} invoices
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-300 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-semibold block">
                  Average Order Value
                </span>
                <span className="text-base font-serif font-bold text-forest-950 font-mono mt-1 block">
                  £{Math.round(selectedCustomer.average_order_value || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-300 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-semibold block">
                  Units Purchased
                </span>
                <span className="text-base font-serif font-bold text-forest-950 font-mono mt-1 block">
                  {Math.round(selectedCustomer.units_purchased || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* RFM Dimensional Breakdown */}
            <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-ivory-200 pb-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-forest-900">
                  RFM Dimensional Scores
                </h4>
                <span className="px-2 py-0.5 rounded bg-gold-100 text-gold-900 font-mono font-bold text-xs">
                  Score: {selectedCustomer.rfm_score || `${selectedCustomer.r_score}${selectedCustomer.f_score}${selectedCustomer.m_score}`}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-forest-800">
                    <span>Recency (Last active {selectedCustomer.recency} days ago)</span>
                    <span className="font-mono font-bold">{selectedCustomer.r_score} / 5</span>
                  </div>
                  <div className="h-1.5 bg-ivory-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(selectedCustomer.r_score / 5) * 100}%` }}
                      className="h-full bg-forest-800 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-forest-800">
                    <span>Frequency ({selectedCustomer.frequency || selectedCustomer.order_count} orders)</span>
                    <span className="font-mono font-bold">{selectedCustomer.f_score} / 5</span>
                  </div>
                  <div className="h-1.5 bg-ivory-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(selectedCustomer.f_score / 5) * 100}%` }}
                      className="h-full bg-gold-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-forest-800">
                    <span>Monetary (£{Math.round(selectedCustomer.monetary_value).toLocaleString()})</span>
                    <span className="font-mono font-bold">{selectedCustomer.m_score} / 5</span>
                  </div>
                  <div className="h-1.5 bg-ivory-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(selectedCustomer.m_score / 5) * 100}%` }}
                      className="h-full bg-navy-700 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Dates */}
            <div className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-forest-600">First Purchase Recorded:</span>
                <span className="font-medium text-forest-900 font-mono">
                  {selectedCustomer.first_purchase ? new Date(selectedCustomer.first_purchase).toLocaleDateString() : 'Historical'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest-600">Latest Purchase Recorded:</span>
                <span className="font-medium text-forest-900 font-mono">
                  {selectedCustomer.last_purchase ? new Date(selectedCustomer.last_purchase).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>

            {/* Recommended Action Playbook */}
            <div className="p-5 bg-gold-50/70 rounded-xl border border-gold-300 text-forest-950 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gold-800 block">
                Prescribed Retention Action
              </span>
              <p className="text-sm font-serif font-bold text-forest-950">
                {selectedCustomer.retention_action || 'VIP Concierge Outreach'}
              </p>
              <p className="text-xs text-forest-800 leading-relaxed">
                Deploy customized tier incentives and prioritized account manager check-in to ensure repeat order cadence.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
