"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { listAuditLog } from "@/lib/api/auditLog";
import type { AuditLogEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminHistoryPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-log", page],
    queryFn: () => listAuditLog({ page }),
    retry: 0,
  });

  const columns: DataTableColumn<AuditLogEntry>[] = [
    { key: "timestamp", header: "Timestamp", render: (r) => formatDateTime(r.timestamp), primary: true },
    { key: "actor", header: "Actor", render: (r) => r.actorName ?? r.actorId },
    { key: "entityType", header: "Entity Type", render: (r) => r.entityType },
    { key: "entityId", header: "Entity", render: (r) => r.entityId.slice(0, 8) + "…" },
    { key: "action", header: "Action", render: (r) => r.action },
  ];

  return (
    <div>
      <PageHeader
        title="History"
        description="System-wide audit log — who changed what, and when. Separate from Management, which shows current state."
      />
      {isError ? (
        <p className="rounded-card border border-dashed border-rsl-border bg-white p-8 text-center text-body-md text-rsl-muted">
          Audit log isn&apos;t reachable right now — this page will populate automatically once{" "}
          <code className="text-[11px]">GET /admin/audit-log</code> is live.
        </p>
      ) : (
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(r) => `${r.entityType}-${r.entityId}-${r.timestamp}`}
          loading={isLoading}
          emptyTitle="No activity yet"
          page={data?.page ?? page}
          pageSize={data?.pageSize ?? 10}
          total={data?.total ?? 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
