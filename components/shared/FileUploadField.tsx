"use client";

import { useRef, useState } from "react";
import { Upload, FileCheck2, X, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/api/uploads";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

const MAX_MB = 10;

export default function FileUploadField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_MB}MB`);
      return;
    }
    setUploading(true);
    try {
      const res = await uploadFile(file);
      onChange(res.url);
      setFileName(file.name);
      toast.success("File attached");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-field border-[1.4px] border-rsl-border bg-surface px-3 py-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          <FileCheck2 className="h-4 w-4 shrink-0 text-status-done-fg" />
          <span className="truncate text-body text-ink">{fileName ?? "Attached file"}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setFileName(null);
          }}
          className="text-rsl-muted hover:text-rsl-red"
          aria-label="Remove attachment"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="flex w-full items-center justify-between rounded-field border-[1.4px] border-dashed border-rsl-border bg-surface px-3 py-[11px] text-left hover:border-rsl-red disabled:opacity-60"
    >
      <span className="text-body text-placeholder">
        {uploading ? "Uploading..." : "Attach External PDF (optional)"}
      </span>
      {uploading ? (
        <Loader2 className="h-4 w-4 animate-spin text-rsl-muted" />
      ) : (
        <Upload className="h-4 w-4 text-rsl-muted" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  );
}
