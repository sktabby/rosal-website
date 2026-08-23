"use client";

import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Used as the mobile card's bold header line instead of a label:value row. */
  primary?: boolean;
  /** Right-aligned on desktop (good for amounts). */
  align?: "left" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  /** Rendered top-right of the mobile card and as a normal column on desktop if included in `columns` too. */
  cardBadge?: (row: T) => React.ReactNode;
  actions?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyTitle,
  emptyDescription,
  page,
  pageSize,
  total,
  onPageChange,
  onRowClick,
  cardBadge,
  actions,
}: DataTableProps<T>) {
  const primaryCol = columns.find((c) => c.primary) ?? columns[0];
  const secondaryCols = columns.filter((c) => c !== primaryCol);

  if (loading) {
    return (
      <div className="space-y-2">
        {/* Desktop skeleton */}
        <div className="hidden md:block rounded-card border border-rsl-border bg-white overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-[#f2f2f2] px-4 py-3 last:border-0">
              {columns.map((c) => (
                <Skeleton key={c.key} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-card border border-[#ececec] bg-white p-3 shadow-card">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div>
      {/* Desktop / tablet: real table, horizontal scroll if needed */}
      <div className="hidden md:block rounded-card border border-rsl-border bg-white overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b-2 border-[#eeeeee]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-rsl-muted ${
                    c.align === "right" ? "text-right" : ""
                  }`}
                >
                  {c.header}
                </th>
              ))}
              {actions && <th className="px-4 py-2.5" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[#f2f2f2] last:border-0 ${
                  onRowClick ? "cursor-pointer hover:bg-[#fafafa]" : ""
                }`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 text-body text-rsl-black ${c.align === "right" ? "text-right" : ""} ${c.className ?? ""}`}>
                    {c.render(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-2">
        {rows.map((row) => (
          <div
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            className={`rounded-card border border-[#ececec] bg-white p-3 shadow-card ${
              onRowClick ? "cursor-pointer active:bg-[#fafafa]" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-body-md font-bold text-rsl-black">{primaryCol.render(row)}</div>
              {cardBadge?.(row)}
            </div>
            <div className="space-y-1">
              {secondaryCols.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-3 text-meta">
                  <span className="text-rsl-muted uppercase tracking-wide">{c.header}</span>
                  <span className="text-rsl-black text-right">{c.render(row)}</span>
                </div>
              ))}
            </div>
            {actions && (
              <div
                className="mt-3 flex items-center justify-end gap-1 border-t border-[#f2f2f2] pt-2"
                onClick={(e) => e.stopPropagation()}
              >
                {actions(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </div>
  );
}
