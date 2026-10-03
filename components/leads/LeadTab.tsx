"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { listLeads, setLeadHidden } from "@/lib/api/leads";
import type { LeadType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

interface LeadRow {
  id: string;
  hidden: boolean;
}

export default function LeadTab<T extends LeadRow>({
  type,
  columns,
  emptyTitle,
  rowName,
}: {
  type: LeadType;
  columns: DataTableColumn<T>[];
  emptyTitle: string;
  /** Used in hide/unhide toast copy, e.g. "contact message", "quote request". */
  rowName: string;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showHidden, setShowHidden] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["leads", type, page, showHidden],
    queryFn: () => listLeads<T>(type, { page, includeHidden: showHidden }),
  });

  async function toggleHidden(row: T) {
    setUpdatingId(row.id);
    try {
      await setLeadHidden(type, row.id, !row.hidden);
      toast.success(row.hidden ? `${rowName} restored` : `${rowName} hidden`);
      queryClient.invalidateQueries({ queryKey: ["leads", type] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Couldn't update this ${rowName.toLowerCase()}.`);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowHidden((v) => !v);
            setPage(1);
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-field border px-3 py-1.5 text-meta font-semibold transition-colors",
            showHidden ? "border-ink bg-ink text-surface" : "border-rsl-border bg-surface text-rsl-muted hover:text-ink"
          )}
        >
          {showHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {showHidden ? "Showing hidden" : "Show hidden"}
        </button>
      </div>

      {isError ? (
        <div className="rounded-card border border-rsl-border bg-surface p-6 text-center">
          <p className="font-semibold text-ink">Couldn&apos;t load this</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-body font-bold text-rsl-red hover:underline">
            Try again
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(r) => r.id}
          loading={isLoading}
          emptyTitle={showHidden ? "Nothing hidden" : emptyTitle}
          page={data?.page ?? page}
          pageSize={data?.pageSize ?? 20}
          total={data?.total ?? 0}
          onPageChange={setPage}
          actions={(r) => (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={updatingId === r.id}
              onClick={() => toggleHidden(r)}
            >
              {r.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {r.hidden ? "Restore" : "Hide"}
            </Button>
          )}
        />
      )}
    </div>
  );
}
