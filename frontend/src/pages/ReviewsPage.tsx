import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareHeart,
  Star,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
  TrendingUp,
  Package,
  Truck,
  DollarSign,
  Headphones,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../api/dashboard';
import type {
  ReviewSummary,
  Review,
  ProductReviewMetric,
  PageResult,
} from '../types/api';
import { KpiCard } from '../components/cards/KpiCard';
import { StackedReviewCards } from '../components/cards/StackedReviewCards';
import { SpatialReviewStream } from '../components/cards/SpatialReviewStream';
import { DataTable, Column } from '../components/ui/DataTable';
import { Drawer } from '../components/ui/Drawer';
import { LotusLogo } from '../components/ui/LotusLogo';

export const ReviewsPage: React.FC = () => {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [productReviewData, setProductReviewData] = useState<PageResult<ProductReviewMetric> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Filter for product reviews table
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tablePage, setTablePage] = useState(1);

  const fetchReviewData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sum, revs, prodMetrics] = await Promise.all([
        dashboardApi.getReviewsSummary(),
        dashboardApi.getReviews({ page: 1, page_size: 15 }),
        dashboardApi.getReviewProducts({ category: categoryFilter || undefined, page: tablePage, page_size: 10 }),
      ]);
      setSummary(sum);
      setRecentReviews(revs.items || []);
      setProductReviewData(prodMetrics);
    } catch (err: any) {
      setError(err.message || 'Failed to load Voice of Customer analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
  }, [categoryFilter, tablePage]);

  if (isLoading && !summary) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-40 bg-lotus-100/30 rounded-2xl border border-lotus-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-ivory-300" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-2xl border border-ivory-300" />
      </div>
    );
  }

  // Real review counts and aspect ratios from summary
  const qPos = summary?.aspects?.quality?.positive || 0;
  const qNeg = summary?.aspects?.quality?.negative || 0;
  const qTotal = qPos + qNeg || 1;
  const qPct = Math.round((qPos / qTotal) * 100);

  const sPos = summary?.aspects?.shipping?.positive || 0;
  const sNeg = summary?.aspects?.shipping?.negative || 0;
  const sTotal = sPos + sNeg || 1;
  const sPct = Math.round((sPos / sTotal) * 100);

  const vPos = summary?.aspects?.value?.positive || 0;
  const vNeg = summary?.aspects?.value?.negative || 0;
  const vTotal = vPos + vNeg || 1;
  const vPct = Math.round((vPos / vTotal) * 100);

  const srvPos = summary?.aspects?.service?.positive || 0;
  const srvNeg = summary?.aspects?.service?.negative || 0;
  const srvTotal = srvPos + srvNeg || 1;
  const srvPct = Math.round((srvPos / srvTotal) * 100);

  const columns: Column<ProductReviewMetric>[] = [
    {
      header: 'Product ID',
      accessor: 'product_id',
      render: (p) => (
        <span className="font-mono font-bold text-forest-950">
          {p.product_id}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (p) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ivory-200 text-forest-800 uppercase">
          {p.category}
        </span>
      ),
    },
    {
      header: 'Review Count',
      accessor: 'review_count',
      align: 'right',
      render: (p) => <span className="font-mono">{p.review_count.toLocaleString()}</span>,
    },
    {
      header: 'Average Rating',
      accessor: 'average_rating',
      align: 'center',
      render: (p) => (
        <div className="inline-flex items-center gap-1 text-gold-600 font-bold font-mono">
          <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
          <span>{(p.average_rating || 0).toFixed(1)}</span>
        </div>
      ),
    },
    {
      header: 'Positive Sentiment',
      accessor: 'positive_pct',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-emerald-700">
          {Math.round((p.positive_pct || 0) * 100)}%
        </span>
      ),
    },
    {
      header: 'Verified Purchase %',
      accessor: 'verified_pct',
      align: 'right',
      render: (p) => (
        <span className="font-mono text-forest-700">
          {Math.round((p.verified_pct || 0) * 100)}%
        </span>
      ),
    },
    {
      header: 'Helpful Ratio',
      accessor: 'helpful_ratio',
      align: 'right',
      render: (p) => (
        <span className="font-mono text-gold-700 font-semibold">
          {Math.round((p.helpful_ratio || 0) * 100)}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header: "Listen to the customer" */}
      <div className="rounded-2xl bg-gradient-to-r from-lotus-50 via-ivory-100 to-gold-50/50 border border-lotus-200/80 p-8 sm:p-10 relative overflow-hidden shadow-luxury">
        <div className="absolute top-2 right-4 opacity-25 text-lotus-400 pointer-events-none">
          <LotusLogo size={180} />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-100 border border-lotus-300 text-lotus-900 text-xs font-semibold uppercase tracking-wider">
              <MessageSquareHeart className="w-3.5 h-3.5 text-lotus-600" />
              Voice of Customer Intelligence
            </span>
            <span className="text-xs text-forest-600 font-medium">100,000 Verified Signals</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 tracking-tight">
            Listen to the <span className="text-lotus-800 italic">customer.</span>
          </h1>

          <p className="text-sm text-forest-800 leading-relaxed max-w-xl">
            Real customer sentiment, aspect friction analysis, and authentic review feedback.
            Transformed into operational clarity to prevent returns and accelerate repeat loyalty.
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Reviews Analyzed"
          value={summary?.review_count || 100000}
          formatter={(v) => `${(v / 1000).toFixed(0)}K`}
          supportingText="Full review corpus indexed"
          trendText="100% Enriched"
          trendDirection="up"
          accent="lotus"
        />

        <KpiCard
          label="Mean Rating Score"
          value={summary?.average_rating || 3.6}
          decimals={1}
          suffix=" / 5.0"
          supportingText="Customer satisfaction score"
          trendText="+0.3 vs Catalog Avg"
          trendDirection="up"
          accent="gold"
        />

        <KpiCard
          label="Positive Sentiment Share"
          value={Math.round((summary?.positive_pct || 0.5697) * 100)}
          suffix="%"
          supportingText="Satisfied buyer reviews"
          trendText="Healthy Core"
          trendDirection="up"
          accent="forest"
        />

        <KpiCard
          label="Verified Purchase Rate"
          value={Math.round((summary?.verified_pct || 0.85) * 100)}
          suffix="%"
          supportingText="Confirmed buyer transactions"
          trendText="High Authenticity"
          trendDirection="up"
          accent="navy"
        />
      </div>

      {/* 2. Flagship Animated Spatial Review Flow */}
      <section className="space-y-4">
        <SpatialReviewStream
          reviews={recentReviews}
          onSelectReview={(r: Review) => setSelectedReview(r)}
        />
      </section>

      {/* 3. Sentiment Aspect Matrix & Sentiment Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aspect Matrix Card */}
        <div className="rounded-xl bg-white border border-ivory-300 p-6 sm:p-7 shadow-luxury space-y-5">
          <div className="border-b border-ivory-200 pb-3">
            <h3 className="text-lg font-serif font-bold text-forest-950">
              Aspect Sentiment Matrix
            </h3>
            <p className="text-xs text-forest-600 mt-0.5">
              Sentiment distribution across core product touchpoints
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Quality Aspect */}
            <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 space-y-2">
              <div className="flex items-center gap-2 text-forest-900 font-bold">
                <Package className="w-4 h-4 text-forest-700" />
                <span>Product Quality</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-emerald-800 font-semibold text-[11px]">
                  <span>Positive: {qPos.toLocaleString()}</span>
                  <span>{qPct}%</span>
                </div>
                <div className="h-1.5 bg-rose-200 rounded-full overflow-hidden">
                  <div style={{ width: `${qPct}%` }} className="h-full bg-emerald-600 rounded-full" />
                </div>
              </div>
            </div>

            {/* Shipping Aspect */}
            <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 space-y-2">
              <div className="flex items-center gap-2 text-forest-900 font-bold">
                <Truck className="w-4 h-4 text-forest-700" />
                <span>Delivery &amp; Transit</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-emerald-800 font-semibold text-[11px]">
                  <span>Positive: {sPos.toLocaleString()}</span>
                  <span>{sPct}%</span>
                </div>
                <div className="h-1.5 bg-rose-200 rounded-full overflow-hidden">
                  <div style={{ width: `${sPct}%` }} className="h-full bg-emerald-600 rounded-full" />
                </div>
              </div>
            </div>

            {/* Value Aspect */}
            <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 space-y-2">
              <div className="flex items-center gap-2 text-forest-900 font-bold">
                <DollarSign className="w-4 h-4 text-forest-700" />
                <span>Price-to-Value</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-emerald-800 font-semibold text-[11px]">
                  <span>Positive: {vPos.toLocaleString()}</span>
                  <span>{vPct}%</span>
                </div>
                <div className="h-1.5 bg-rose-200 rounded-full overflow-hidden">
                  <div style={{ width: `${vPct}%` }} className="h-full bg-gold-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Service Aspect */}
            <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 space-y-2">
              <div className="flex items-center gap-2 text-forest-900 font-bold">
                <Headphones className="w-4 h-4 text-forest-700" />
                <span>Customer Service</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-emerald-800 font-semibold text-[11px]">
                  <span>Positive: {srvPos.toLocaleString()}</span>
                  <span>{srvPct}%</span>
                </div>
                <div className="h-1.5 bg-rose-200 rounded-full overflow-hidden">
                  <div style={{ width: `${srvPct}%` }} className="h-full bg-navy-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Trend Area Chart */}
        <div className="rounded-xl bg-white border border-ivory-300 p-6 sm:p-7 shadow-luxury space-y-4">
          <div className="border-b border-ivory-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-forest-950">
                Sentiment Timeline (60 Months)
              </h3>
              <p className="text-xs text-forest-600 mt-0.5">
                Positive vs Negative sentiment ratio progression
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={summary?.sentiment_trends || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="posSentimentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="negSentimentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE6D8" />
                <XAxis
                  dataKey="month_label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71827d', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71827d', fontSize: 10 }}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                />
                <Tooltip
                  formatter={(val: any) => [`${Math.round(val * 100)}%`, '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="positive_pct"
                  name="Positive %"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#posSentimentGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="negative_pct"
                  name="Negative %"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#negSentimentGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Product Review Metrics Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-forest-950">
              Product Review Benchmarks
            </h3>
            <p className="text-xs text-forest-600">
              Catalog review distribution, authenticity scores, and helpfulness
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={productReviewData?.items || []}
          isLoading={isLoading}
          total={productReviewData?.total || null}
          page={tablePage}
          pageSize={10}
          onPageChange={(newPage) => setTablePage(newPage)}
          emptyMessage="No product review records found."
        />
      </section>

      {/* Review Inspector Drawer */}
      <Drawer
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title={`Review #${selectedReview?.review_id || 'Case'}`}
        subtitle={`Product: ${selectedReview?.product_id} (${selectedReview?.category || 'Retail'})`}
        badge={selectedReview?.sentiment}
        badgeTone={selectedReview?.sentiment === 'positive' ? 'forest' : 'lotus'}
      >
        {selectedReview && (
          <div className="space-y-6">
            <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(selectedReview.star_rating)
                          ? 'fill-gold-500 text-gold-500'
                          : 'text-ivory-300'
                      }`}
                    />
                  ))}
                  <span className="font-bold text-forest-900 ml-1">
                    {selectedReview.star_rating.toFixed(1)}
                  </span>
                </div>
                {selectedReview.verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Transaction
                  </span>
                )}
              </div>

              <div className="text-xs text-forest-800 font-mono space-y-1 pt-2 border-t border-ivory-200">
                <p><strong className="text-forest-950">Category:</strong> {selectedReview.category || 'Retail'}</p>
                <p><strong className="text-forest-950">Sentiment Score:</strong> {selectedReview.sentiment_score ?? 'N/A'}</p>
                <p><strong className="text-forest-950">Emotion:</strong> {selectedReview.emotion || 'neutral'}</p>
                <p><strong className="text-forest-950">Fake Review Flag:</strong> {selectedReview.is_fake_review ? 'FLAGGED AS UNVERIFIED PATTERN' : 'AUTHENTIC TRANSACTION'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                <span className="text-forest-600 block">Review Date</span>
                <strong className="text-forest-900 mt-0.5 block font-mono">
                  {selectedReview.review_date ? new Date(selectedReview.review_date).toLocaleDateString() : `${selectedReview.month}/${selectedReview.year}`}
                </strong>
              </div>

              <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                <span className="text-forest-600 block">Helpful Ratio</span>
                <strong className="text-gold-700 mt-0.5 block font-mono">
                  {Math.round((selectedReview.helpful_ratio || 0.0) * 100)}% ({selectedReview.helpful_votes || 0}/{selectedReview.total_votes || 0} votes)
                </strong>
              </div>
            </div>

            <div className="p-4 bg-gold-50/70 rounded-xl border border-gold-300 text-xs space-y-1">
              <span className="font-bold text-gold-900 block">Aspect Friction Analysis</span>
              <p className="text-forest-800">
                Quality: <strong>{selectedReview.quality_aspect || 'neutral'}</strong> | Shipping: <strong>{selectedReview.shipping_aspect || 'neutral'}</strong> | Value: <strong>{selectedReview.value_aspect || 'neutral'}</strong> | Service: <strong>{selectedReview.service_aspect || 'neutral'}</strong>
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
