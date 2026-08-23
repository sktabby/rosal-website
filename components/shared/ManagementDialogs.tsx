"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RowActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  deleting?: boolean;
}

export function RowActions({ onView, onEdit, onDelete, deleting }: RowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={onView} className="p-1.5 text-rsl-muted hover:text-rsl-black" aria-label="View" title="View">
        <Eye className="h-4 w-4" />
      </button>
      <button onClick={onEdit} className="p-1.5 text-rsl-muted hover:text-rsl-black" aria-label="Edit" title="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => setConfirmOpen(true)}
        className="p-1.5 text-rsl-muted hover:text-rsl-red"
        aria-label="Delete"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this record?"
        description="This is a soft delete — the record is hidden from normal use but preserved for historical references. There is no reactivate option."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={async () => {
          await onDelete();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}

export function ViewDialog({
  open,
  onOpenChange,
  title,
  fields,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: { label: string; value: React.ReactNode }[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2.5">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start justify-between gap-4 border-b border-[#f2f2f2] pb-2 last:border-0">
              <span className="text-field-label uppercase text-rsl-muted">{f.label}</span>
              <span className="text-right text-body text-rsl-black">{f.value}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
