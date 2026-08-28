import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  sortKey?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  total?: number | null;
  page?: number;
  pageSize?: number;
  onPageChange?: (newPage: number) => void;
  onRowClick?: (item: T) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string | number; [key: string]: any }>({
  columns,
  data,
  isLoading = false,
  total = null,
  page = 1,
  pageSize = 25,
  onPageChange,
  onRowClick,
  sortKey,
  sortDirection = 'desc',
  onSort,
  emptyMessage = 'No matching records found',
}: DataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  return (
    <div className="w-full bg-white rounded-xl border border-ivory-300 shadow-luxury overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-ivory-100/70 border-b border-ivory-300 text-[11px] font-semibold uppercase tracking-wider text-forest-700">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.sortKey && onSort ? (
                    <button
                      onClick={() => onSort(col.sortKey!)}
                      className="inline-flex items-center gap-1.5 hover:text-forest-950 font-semibold uppercase transition-colors"
                    >
                      <span>{col.header}</span>
                      {sortKey === col.sortKey ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-gold-600" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-gold-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-forest-400 opacity-60" />
                      )}
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200 text-sm text-forest-900">
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-4 px-4">
                      <div className="h-4 bg-ivory-300/60 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-forest-600 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={item.id || item.customer_id || item.stock_code || item.product_id || rowIdx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-ivory-100/80' : 'hover:bg-ivory-50/50'
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-3.5 px-4 ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(item)
                        : col.accessor
                        ? String(item[col.accessor] ?? '—')
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {onPageChange && (
        <div className="px-5 py-3.5 bg-ivory-100/40 border-t border-ivory-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-forest-700">
          <div>
            {total !== null ? (
              <span>
                Showing <span className="font-semibold text-forest-950">{(page - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-forest-950">
                  {Math.min(page * pageSize, total)}
                </span>{' '}
                of <span className="font-semibold text-forest-950">{total.toLocaleString()}</span> records
              </span>
            ) : (
              <span>Page {page}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="px-3 py-1.5 rounded-lg border border-ivory-300 bg-white hover:bg-ivory-100 disabled:opacity-40 disabled:cursor-not-allowed text-forest-900 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-2 font-medium">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg border border-ivory-300 bg-white hover:bg-ivory-100 disabled:opacity-40 disabled:cursor-not-allowed text-forest-900 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
