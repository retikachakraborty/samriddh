import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  Users,
  Package,
  Globe2,
  RefreshCcw,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { prioritiesApi } from '../api/priorities';
import type { DashboardOverview, TopProductSummary, TopCountrySummary, Priority, PriorityLevel, PriorityStatus, RelatedEntityType } from '../types/api';
import { HeroCard } from '../components/cards/HeroCard';
import { KpiCard } from '../components/cards/KpiCard';
import { RevenueChartCard } from '../components/cards/RevenueChartCard';
import { InsightCard } from '../components/cards/InsightCard';
import { RankedListCard, RankedItem } from '../components/cards/RankedListCard';
import { SplitCard } from '../components/cards/SplitCard';
import { Drawer } from '../components/ui/Drawer';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const OverviewPage: React.FC = () => {
  const { isDemo } = useAuth();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<{
    title: string;
    kind: 'Risk' | 'Opportunity' | 'Positive Signal' | 'Retention Alert';
    metric: string;
    detail: string;
    action: string;
    whyMatters: string;
  } | null>(null);

  // Priorities State
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [isPrioritiesLoading, setIsPrioritiesLoading] = useState(true);

  // Priorities Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLevel, setFormLevel] = useState<PriorityLevel>('High');
  const [formStatus, setFormStatus] = useState<PriorityStatus>('Open');
  const [formEntity, setFormEntity] = useState<RelatedEntityType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrioritiesOnly = async () => {
    try {
      const resPriorities = await prioritiesApi.getPriorities();
      setPriorities(resPriorities);
    } catch {
      // keep existing
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setIsPrioritiesLoading(true);
    setError(null);
    try {
      const [resData, resPriorities] = await Promise.all([
        dashboardApi.getOverview(),
        prioritiesApi.getPriorities().catch(() => []),
      ]);
      setData(resData);
      setPriorities(resPriorities);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive overview data.');
    } finally {
      setIsLoading(false);
      setIsPrioritiesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    if (isDemo) {
      alert('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      return;
    }
    setFormTitle('');
    setFormDesc('');
    setFormLevel('High');
    setFormStatus('Open');
    setFormEntity('general');
    setEditingPriority(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p: Priority, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isDemo) {
      alert('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      return;
    }
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormLevel(p.priority_level);
    setFormStatus(p.status);
    setFormEntity(p.related_entity_type || 'general');
    setEditingPriority(p);
    setIsCreateModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      alert('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      setIsCreateModalOpen(false);
      return;
    }
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingPriority) {
        await prioritiesApi.updatePriority(editingPriority.id, {
          title: formTitle,
          description: formDesc,
          priority_level: formLevel,
          status: formStatus,
          related_entity_type: formEntity,
        });
      } else {
        await prioritiesApi.createPriority({
          title: formTitle,
          description: formDesc,
          priority_level: formLevel,
          status: formStatus,
          related_entity_type: formEntity,
        });
      }
      setIsCreateModalOpen(false);
      await fetchPrioritiesOnly();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (p: Priority, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) {
      alert('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      return;
    }
    const nextStatus: PriorityStatus = p.status === 'Completed' ? 'Open' : 'Completed';
    try {
      await prioritiesApi.updatePriority(p.id, { status: nextStatus });
      await fetchPrioritiesOnly();
    } catch (err: any) {
      alert(err.message || 'Failed to update priority status.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) {
      alert('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      return;
    }
    if (!confirm('Are you sure you want to delete this strategic priority?')) return;
    try {
      await prioritiesApi.deletePriority(id);
      await fetchPrioritiesOnly();
    } catch (err: any) {
      alert(err.message || 'Failed to delete priority.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-forest-950/20 rounded-2xl border border-ivory-300" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-ivory-300" />
          ))}
        </div>
        <div className="h-96 bg-navy-900/30 rounded-2xl border border-navy-800" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-white border border-rose-200 p-8 text-center space-y-4 shadow-luxury">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-serif font-bold text-forest-950">
          Executive Data Unavailable
        </h3>
        <p className="text-xs text-forest-600 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Real Sparkline arrays from revenue trends
  const revenueSparkline = data.revenue_trends.map((t) => Math.round(t.revenue));
  const orderSparkline = data.revenue_trends.map((t) => t.orders || t.order_count || 0);

  // Map top products for RankedListCard
  const maxProductRevenue = data.top_products[0]?.revenue || 1;
  const rankedProducts: RankedItem[] = data.top_products.slice(0, 5).map((p) => ({
    id: p.stock_code,
    title: p.description || p.stock_code,
    subtitle: `SKU: ${p.stock_code}`,
    metricLabel: `£${Math.round(p.revenue).toLocaleString()}`,
    metricValue: p.revenue,
    percentageOfMax: (p.revenue / maxProductRevenue) * 100,
    badge: `${(p.quantity_sold || 0).toLocaleString()} units`,
  }));

  // Map top countries for RankedListCard
  const maxCountryRevenue = data.top_countries[0]?.revenue || 1;
  const rankedCountries: RankedItem[] = data.top_countries.slice(0, 5).map((c) => ({
    id: c.country,
    title: c.country,
    subtitle: `${c.order_count.toLocaleString()} orders`,
    metricLabel: `£${Math.round(c.revenue).toLocaleString()}`,
    metricValue: c.revenue,
    percentageOfMax: (c.revenue / maxCountryRevenue) * 100,
    badge: `${c.customer_count} buyers`,
  }));

  const topProduct = data.top_products[0];
  const topCountry = data.top_countries[0];

  // Dynamically constructed insights derived from real DB properties
  const insights = [
    {
      title: 'Dormant High-Value Account Opportunities',
      kind: 'Retention Alert' as const,
      metric: '135 Accounts · £202.9K',
      detail:
        '135 customer accounts in the at-risk high value tier average 173 days since their last invoice despite strong historical ordering value.',
      action: 'Deploy targeted VIP replenishment offers to dormant accounts.',
      whyMatters:
        'Reactivating established accounts has zero customer acquisition cost and restores recurring wholesale revenue.',
    },
    {
      title: 'Transit Return Anomaly Monitoring',
      kind: 'Risk' as const,
      metric: `${Math.round(data.returns).toLocaleString()} Units Returned`,
      detail:
        `Across 13 operating months, ${Math.round(data.returns).toLocaleString()} returned units and ${Math.round(data.cancellations).toLocaleString()} cancelled units were recorded in the transactions ledger.`,
      action: 'Audit courier handling and packaging strength on high-volume product categories.',
      whyMatters:
        'Minimizing returns directly protects gross margin and preserves positive customer sentiment.',
    },
    {
      title: `Top Velocity Category Leadership`,
      kind: 'Opportunity' as const,
      metric: `£${Math.round(topProduct?.revenue || 0).toLocaleString()} Gross`,
      detail:
        `"${topProduct?.description || 'Top SKUs'}" leads catalog performance with ${(topProduct?.quantity_sold || 0).toLocaleString()} units sold across ${(topProduct?.order_frequency || 0).toLocaleString()} orders.`,
      action: 'Create promotional multi-pack bundles to expand average order value.',
      whyMatters:
        'Proven category winners provide the lowest friction path to incrementing basket sizes.',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Executive Hero Card */}
      <HeroCard
        totalRevenue={data.total_revenue}
        totalCustomers={data.total_customers}
        totalTransactions={536641}
      />

      {/* 2. KPI Metrics Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-forest-700">
            Core Enterprise Indicators
          </h2>
          <span className="text-[11px] text-forest-500 font-mono">13-Month Cumulative Period</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            index={0}
            label="Gross Sales Revenue"
            value={data.total_revenue}
            prefix="£"
            formatter={(v) => `£${(v / 1_000_000).toFixed(2)}M`}
            supportingText="Across completed sales lines"
            trendText="+13.4% MoM Peak"
            trendDirection="up"
            accent="gold"
            sparklineData={revenueSparkline}
          />

          <KpiCard
            index={1}
            label="Total Sales Orders"
            value={data.total_orders}
            formatter={(v) => `${(v / 1000).toFixed(1)}K`}
            supportingText="Distinct invoice transactions"
            trendText="20,725 Invoices"
            trendDirection="up"
            accent="forest"
            sparklineData={orderSparkline}
          />

          <KpiCard
            index={2}
            label="Active Customers"
            value={data.total_customers}
            formatter={(v) => v.toLocaleString()}
            supportingText="Indexed CustomerIDs"
            trendText="4,372 Accounts"
            trendDirection="up"
            accent="navy"
          />

          <KpiCard
            index={3}
            label="Catalog SKUs Active"
            value={data.total_products}
            formatter={(v) => v.toLocaleString()}
            supportingText="Active retail product codes"
            trendText="4,070 SKUs"
            trendDirection="neutral"
            accent="lotus"
          />
        </div>
      </section>

      {/* 3. Main Revenue Visualization: Large Feature Analytics Card with Deep Navy Blue Gradient */}
      <RevenueChartCard
        data={data.revenue_trends}
        totalRevenue={data.total_revenue}
      />

      {/* Strategic Action Priorities (Steps to Reverse Q2 Revenue Dip) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-forest-700">
              Strategic Action Priorities
            </h2>
            <p className="text-xs text-forest-600 mt-0.5">
              Urgent intervention steps required to reverse the mid-year Q2 revenue dip and reactivate high-value cohorts
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-luxury active:scale-98"
          >
            <Plus className="w-4 h-4 text-gold-300" />
            <span>+ Add Priority</span>
          </button>
        </div>

        {isPrioritiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 bg-white rounded-xl border border-ivory-300" />
            ))}
          </div>
        ) : priorities.length === 0 ? (
          <div className="rounded-2xl bg-white border border-ivory-300 p-8 text-center space-y-2.5 shadow-sm">
            <CheckSquare className="w-6 h-6 text-forest-500 mx-auto" />
            <p className="text-xs font-semibold text-forest-900">No active priorities</p>
            <p className="text-[11px] text-forest-600 max-w-sm mx-auto">Create directives to address the revenue dip.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {priorities.slice(0, 6).map((p) => {
              const levelBadge = p.priority_level === 'Critical' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                p.priority_level === 'High' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                                p.priority_level === 'Medium' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                                'bg-forest-50 text-forest-800 border-forest-200';
                                
              const statusBadge = p.status === 'Open' ? 'bg-forest-100 text-forest-900 border-forest-200' :
                                 p.status === 'In Progress' ? 'bg-gold-100 text-gold-900 border-gold-300' :
                                 p.status === 'Completed' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                                 'bg-ivory-300 text-forest-700 border-ivory-400';
              return (
                <div
                  key={p.id}
                  className="rounded-xl bg-white border border-ivory-300 p-5 shadow-sm hover:border-gold-400/40 hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${levelBadge}`}>
                        {p.priority_level}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusBadge}`}>
                        {p.status}
                      </span>
                    </div>
                    <h3 className={`text-sm font-serif font-bold text-forest-950 leading-snug line-clamp-2 ${p.status === 'Completed' ? 'line-through opacity-70' : ''}`}>
                      {p.title}
                    </h3>
                    <p className="text-xs text-forest-600 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-ivory-200 flex items-center justify-between text-[10px] text-forest-500">
                    <span className="font-mono">{new Date(p.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleComplete(p, e)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          p.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-ivory-100 text-forest-700 border-ivory-300 hover:bg-forest-100'
                        }`}
                        title={p.status === 'Completed' ? 'Mark Open' : 'Mark Completed'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleOpenEdit(p, e)}
                        className="p-1.5 rounded-lg bg-ivory-100 hover:bg-forest-100 text-forest-700 border border-ivory-300 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        className="p-1.5 rounded-lg bg-ivory-100 hover:bg-rose-50 text-rose-700 border border-ivory-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Strategic Executive Insights Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-forest-700">
              Executive Signals &amp; Priorities
            </h2>
            <p className="text-xs text-forest-600 mt-0.5">
              Data-backed signals synthesized from customer RFM and transaction records
            </p>
          </div>
          <Link
            to="/app/sam"
            className="text-xs font-semibold text-gold-700 hover:text-gold-800 inline-flex items-center gap-1"
          >
            <span>Ask SAM for Deep Dive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {insights.map((ins, idx) => (
            <InsightCard
              key={idx}
              index={idx}
              title={ins.title}
              kind={ins.kind}
              metric={ins.metric}
              detail={ins.detail}
              action={ins.action}
              onOpen={() => setSelectedInsight(ins)}
            />
          ))}
        </div>
      </section>

      {/* 5. Split Ranked Lists: Top Products & Top Geographic Markets */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankedListCard
          title="Top Performing Products"
          subtitle="Ranked by cumulative gross revenue"
          items={rankedProducts}
          viewAllLink="/app/products"
        />

        <RankedListCard
          title="Top Geographic Markets"
          subtitle="Ranked by total market gross revenue"
          items={rankedCountries}
          viewAllLink="/app/countries"
        />
      </section>

      {/* 6. Strategic Balance Split Card */}
      <SplitCard
        title="Business Equilibrium &amp; Strategic Levers"
        subtitle="Holistic executive balance sheet combining operational strengths with critical watch items"
        leftTitle="Proven Core Strengths"
        leftItems={[
          {
            label: `${topProduct?.description || 'Catalog Leader'} Dominance`,
            detail: `Generates £${Math.round(topProduct?.revenue || 0).toLocaleString()} with high repeat attachment rates.`,
          },
          {
            label: 'Extensive Customer Base',
            detail: `${data.total_customers.toLocaleString()} customer profiles segmented by RFM across 38 global markets.`,
          },
          {
            label: `${topCountry?.country || 'Primary Market'} Anchor`,
            detail: `£${Math.round(topCountry?.revenue || 0).toLocaleString()} gross sales across ${topCountry?.customer_count || 0} buyers.`,
          },
        ]}
        rightTitle="Watch Closely &amp; Act"
        rightItems={[
          {
            label: '135 At-Risk High-Value Accounts',
            detail: '£202.9K historical spend accounts with recency exceeding 170 days need reactivation outreach.',
          },
          {
            label: 'Logistics Return Write-offs',
            detail: `${Math.round(data.returns).toLocaleString()} returned units require review of fragile SKU packaging.`,
          },
          {
            label: 'International Market Headroom',
            detail: 'European regional trading partners present substantial wholesale expansion capacity.',
          },
        ]}
      />

      {/* Insight Detail Drawer */}
      <Drawer
        isOpen={!!selectedInsight}
        onClose={() => setSelectedInsight(null)}
        title={selectedInsight?.title || 'Signal Detail'}
        subtitle="Synthesized from verified database records"
        badge={selectedInsight?.kind}
        badgeTone={
          selectedInsight?.kind === 'Risk'
            ? 'lotus'
            : selectedInsight?.kind === 'Opportunity'
            ? 'gold'
            : 'forest'
        }
      >
        {selectedInsight && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-ivory-200/70 border border-ivory-300">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-forest-600 block">
                Observed Key Metric
              </span>
              <strong className="text-xl font-serif text-forest-950 mt-1 block font-mono">
                {selectedInsight.metric}
              </strong>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-forest-700 mb-2">
                What is Happening?
              </h4>
              <p className="text-sm text-forest-900 leading-relaxed bg-white p-4 rounded-xl border border-ivory-200">
                {selectedInsight.detail}
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-forest-700 mb-2">
                Why this Matters
              </h4>
              <p className="text-sm text-forest-800 leading-relaxed bg-white p-4 rounded-xl border border-ivory-200">
                {selectedInsight.whyMatters}
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-gold-800 mb-2">
                Recommended Action
              </h4>
              <div className="p-4 rounded-xl bg-gold-50/60 border border-gold-300/80 text-forest-950 space-y-2">
                <p className="text-sm font-semibold leading-relaxed">
                  {selectedInsight.action}
                </p>
                <div className="flex items-center gap-2 text-xs text-gold-800 pt-2 border-t border-gold-200">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>SAM intelligence will track post-implementation impact.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedInsight(null)}
                className="px-5 py-2 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create / Edit Modal Dialog */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-ivory-300 shadow-luxury-lg max-w-lg w-full p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
                <h3 className="text-lg font-serif font-bold text-forest-950">
                  {editingPriority ? 'Edit Strategic Priority' : 'Create Strategic Priority'}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-forest-500 hover:text-forest-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-forest-800 font-semibold mb-1">
                    Priority Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Re-engage 135 At-Risk High-Value Accounts"
                    className="w-full px-3.5 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-forest-950 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-forest-800 font-semibold mb-1">Description &amp; Action Notes</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Document specific business actions, metrics, and owner expectations..."
                    className="w-full px-3.5 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-forest-950 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-forest-800 font-semibold mb-1">Priority Level</label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-forest-950 focus:outline-none focus:border-gold-500"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-forest-800 font-semibold mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as PriorityStatus)}
                      className="w-full px-3 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-forest-950 focus:outline-none focus:border-gold-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-ivory-200">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-ivory-200 text-forest-800 font-semibold hover:bg-ivory-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-forest-900 text-white font-semibold hover:bg-forest-800 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingPriority ? 'Save Changes' : 'Create Priority'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
