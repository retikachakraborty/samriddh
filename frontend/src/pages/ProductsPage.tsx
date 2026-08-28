import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  ArrowUpDown,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { dashboardApi, ProductQueryParams } from '../api/dashboard';
import type { ProductMetric, PageResult } from '../types/api';
import { KpiCard } from '../components/cards/KpiCard';
import { DataTable, Column } from '../components/ui/DataTable';
import { Drawer } from '../components/ui/Drawer';

export const ProductsPage: React.FC = () => {
  const [data, setData] = useState<PageResult<ProductMetric> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductMetric | null>(null);

  // Search and Sort
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'revenue' | 'quantity_sold' | 'return_rate' | 'order_frequency'>('revenue');
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: ProductQueryParams = {
        search: search.trim() || undefined,
        sort,
        descending,
        page,
        page_size: pageSize,
      };
      const result = await dashboardApi.getProducts(params);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sort, descending]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleSortChange = (newSort: string) => {
    if (sort === newSort) {
      setDescending(!descending);
    } else {
      setSort(newSort as any);
      setDescending(true);
    }
    setPage(1);
  };

  const columns: Column<ProductMetric>[] = [
    {
      header: 'Product Description',
      accessor: 'description',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ivory-200 text-forest-900 font-serif font-bold text-xs flex items-center justify-center shrink-0">
            ✦
          </div>
          <div className="max-w-md">
            <span className="font-serif font-bold text-forest-950 block truncate text-sm">
              {p.description || 'Unnamed SKU'}
            </span>
            <span className="text-[11px] font-mono text-forest-600">
              Code: {p.stock_code}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Gross Revenue',
      accessor: 'revenue',
      sortKey: 'revenue',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-forest-950">
          £{Math.round(p.revenue).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Units Sold',
      accessor: 'quantity_sold',
      sortKey: 'quantity_sold',
      align: 'right',
      render: (p) => (
        <span className="font-mono text-forest-800">
          {p.quantity_sold.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Order Frequency',
      accessor: 'order_frequency',
      sortKey: 'order_frequency',
      align: 'center',
      render: (p) => (
        <span className="px-2 py-0.5 rounded bg-ivory-200 text-forest-900 font-mono text-xs font-semibold">
          {p.order_frequency} orders
        </span>
      ),
    },
    {
      header: 'Return Rate',
      accessor: 'return_rate',
      sortKey: 'return_rate',
      align: 'right',
      render: (p) => {
        const rate = (p.return_rate || 0) * 100;
        const isHigh = rate > 20;
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${
              isHigh ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {isHigh && <AlertTriangle className="w-3 h-3 text-rose-600" />}
            {rate.toFixed(1)}%
          </span>
        );
      },
    },
    {
      header: 'Health Status',
      render: (p) => {
        const rate = (p.return_rate || 0) * 100;
        if (rate > 40) {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-100 text-rose-800 border border-rose-200">
              High Return Risk
            </span>
          );
        }
        if (p.revenue > 50000) {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-gold-100 text-gold-900 border border-gold-300 font-semibold">
              Bestseller
            </span>
          );
        }
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
            Stable
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-700">
            Product Portfolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
            SKU Performance &amp; Return Anomaly Detection
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 mt-1">
            Tracking revenue yield, velocity, and return overhead across 4,070 indexed SKUs
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Catalog SKUs"
          value={4070}
          formatter={(v) => v.toLocaleString()}
          supportingText="Active retail product codes"
          trendText="100% Tracked"
          trendDirection="neutral"
          accent="forest"
          sparklineData={[3800, 3920, 4000, 4050, 4070]}
        />

        <KpiCard
          label="Top Revenue SKU"
          value={174487}
          prefix="£"
          formatter={(v) => `£${(v / 1000).toFixed(0)}K`}
          supportingText="Regency Cakestand 3 Tier"
          trendText="Top Volume"
          trendDirection="up"
          accent="gold"
          sparklineData={[90, 110, 130, 155, 174]}
        />

        <KpiCard
          label="Catalog Mean Return Rate"
          value={3.8}
          suffix="%"
          decimals={1}
          supportingText="Logistics return ratio"
          trendText="Under Control"
          trendDirection="up"
          accent="navy"
          sparklineData={[5.2, 4.8, 4.2, 3.9, 3.8]}
        />

        <KpiCard
          label="High Return Risk SKUs"
          value={14}
          supportingText="Return rate > 25%"
          trendText="Attention Needed"
          trendDirection="down"
          accent="lotus"
          sparklineData={[22, 19, 17, 15, 14]}
        />
      </div>

      {/* Toolbar: Search, Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU description or code..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-ivory-300 rounded-xl text-xs text-forest-950 focus:outline-none focus:border-gold-500 transition-colors shadow-sm"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-forest-600 font-medium hidden sm:inline">Sort:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as any);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-white border border-ivory-300 rounded-xl text-xs text-forest-800 font-medium focus:outline-none focus:border-gold-500 shadow-sm"
          >
            <option value="revenue">Gross Revenue</option>
            <option value="quantity_sold">Quantity Sold</option>
            <option value="return_rate">Return Rate</option>
            <option value="order_frequency">Order Frequency</option>
          </select>
        </div>
      </div>

      {/* Product Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        total={data?.total || null}
        page={page}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        onRowClick={(product) => setSelectedProduct(product)}
        sortKey={sort}
        sortDirection={descending ? 'desc' : 'asc'}
        onSort={handleSortChange}
        emptyMessage="No products found matching the search criteria."
      />

      {/* Product Detail Drawer */}
      <Drawer
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.description || 'Product Details'}
        subtitle={`Stock Code: ${selectedProduct?.stock_code}`}
        badge={selectedProduct?.revenue && selectedProduct.revenue > 50000 ? 'Top Tier SKU' : 'Catalog Item'}
        badgeTone="gold"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-ivory-300 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-semibold block">
                  Gross Revenue
                </span>
                <span className="text-xl font-serif font-bold text-forest-950 font-mono mt-1 block">
                  £{Math.round(selectedProduct.revenue).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-300 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-semibold block">
                  Quantity Sold
                </span>
                <span className="text-xl font-serif font-bold text-forest-950 font-mono mt-1 block">
                  {selectedProduct.quantity_sold.toLocaleString()} units
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-300 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-semibold block">
                  Order Invoices
                </span>
                <span className="text-base font-serif font-bold text-forest-950 font-mono mt-1 block">
                  {selectedProduct.order_frequency} orders
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-300 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-semibold block">
                  Return Rate
                </span>
                <span className={`text-base font-serif font-bold font-mono mt-1 block ${
                  (selectedProduct.return_rate || 0) > 0.2 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {((selectedProduct.return_rate || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Return & Logistics Assessment */}
            <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-sm space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-forest-900 border-b border-ivory-200 pb-2">
                Logistics &amp; Quality Assessment
              </h4>
              <p className="text-xs text-forest-800 leading-relaxed">
                {(selectedProduct.return_rate || 0) > 0.3
                  ? `Elevated return rate observed on SKU ${selectedProduct.stock_code}. Customer feedback flags fragile packaging and assembly instruction ambiguity.`
                  : `SKU ${selectedProduct.stock_code} shows healthy commercial velocity and minimal return overhead across international customer orders.`}
              </p>
            </div>

            {/* Strategic Merchandising Guidance */}
            <div className="p-5 bg-gold-50/70 rounded-xl border border-gold-300 text-forest-950 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gold-800 block">
                Merchandising Recommendation
              </span>
              <p className="text-sm font-serif font-bold text-forest-950">
                {selectedProduct.revenue > 50000
                  ? 'Expand Bundle Attachments & Regional Stock'
                  : (selectedProduct.return_rate || 0) > 0.25
                  ? 'Audit Supplier Packaging & Update Listing Photos'
                  : 'Maintain Promotional Placement'}
              </p>
              <p className="text-xs text-forest-800 leading-relaxed">
                Integrated into SAM predictive replenishment signals and inventory monitoring.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
