"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/shared/FormField";
import { getCompanySettings } from "@/lib/api/companySettings";
import { updateNotificationPrefs } from "@/lib/api/auth";
import { apiRequest } from "@/lib/api/http";
import { useSession } from "@/providers/SessionProvider";
import { fullName, initials, formatDateTime } from "@/lib/utils";
import type { AuthUser } from "@/lib/types";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

interface AccountViewProps {
  showEdit?: boolean;
  showCompanySettingsLink?: boolean;
  factoryUnitName?: string;
  roleIdLabel: string;
}

export default function AccountView({
  showEdit = false,
  showCompanySettingsLink = false,
  factoryUnitName,
  roleIdLabel,
}: AccountViewProps) {
  const { user, refresh, logout } = useSession();
  const { data: company } = useQuery({ queryKey: ["company-settings"], queryFn: getCompanySettings });

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [push, setPush] = useState(user?.pushNotificationsEnabled ?? true);
  const [email, setEmail] = useState(user?.emailNotificationsEnabled ?? true);

  if (!user) return null;
  const currentUser = user;

  async function togglePush(next: boolean) {
    setPush(next);
    try {
      await updateNotificationPrefs({ push: next });
    } catch {
      setPush(!next);
      toast.error("Couldn't update notification preference.");
    }
  }

  async function toggleEmail(next: boolean) {
    setEmail(next);
    try {
      await updateNotificationPrefs({ email: next });
    } catch {
      setEmail(!next);
      toast.error("Couldn't update notification preference.");
    }
  }

  function startEdit() {
    setEditForm({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      phone: currentUser.phone ?? "",
      email: currentUser.email ?? "",
    });
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      // Best-guess route — not confirmed to exist in the delivered
      // contract (only /account/me GET, /account/change-password, and
      // /account/notification-prefs were confirmed). Fails gracefully.
      await apiRequest<AuthUser>("/account/me", { method: "PATCH", body: editForm });
      await refresh();
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        toast("Profile editing isn't available yet from this screen.");
      } else {
        toast.error(err instanceof ApiError ? err.message : "Couldn't update profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[640px] space-y-4">
      {/* Identity card */}
      <div className="rounded-card border border-rsl-border bg-white p-4 lg:p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-rsl-black text-[18px] font-bold text-white">
              {initials(currentUser)}
            </div>
            <div>
              <p className="text-body-md font-bold text-rsl-black">{fullName(currentUser)}</p>
              <p className="text-meta text-rsl-muted">
                {roleIdLabel} · {currentUser.employeeCode}
              </p>
              {currentUser.email && <p className="text-meta text-rsl-muted">{currentUser.email}</p>}
              {factoryUnitName && <p className="mt-1 text-meta text-rsl-black font-bold">Factory Unit: {factoryUnitName}</p>}
            </div>
          </div>
          {showEdit && !editing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </div>

        {editing && (
          <div className="mt-4 border-t border-[#f2f2f2] pt-4">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FormField label="First Name">
                <Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} />
              </FormField>
              <FormField label="Last Name">
                <Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} />
              </FormField>
              <FormField label="Phone">
                <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
              </FormField>
              <FormField label="Email">
                <Input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
              </FormField>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="black" loading={saving} onClick={saveEdit}>Save</Button>
            </div>
          </div>
        )}
      </div>

      {/* Session info */}
      <div className="rounded-card bg-rsl-bg-soft border border-rsl-border p-4 lg:p-5">
        <p className="mb-3 text-section-label uppercase text-rsl-muted">Session Info</p>
        <div className="space-y-2 text-body">
          <div className="flex justify-between"><span className="text-rsl-muted">Last Login</span><span>{formatDateTime(currentUser.lastLoginAt)}</span></div>
          <div className="flex justify-between"><span className="text-rsl-muted">Device</span><span>{currentUser.lastLoginDevice ?? "—"}</span></div>
          <div className="flex justify-between items-center"><span className="text-rsl-muted">Session Status</span><Badge className="bg-status-done-bg text-status-done-fg">Active</Badge></div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-card border border-rsl-border bg-white p-4 lg:p-5">
        <p className="mb-3 text-section-label uppercase text-rsl-muted">Notifications</p>
        <div className="flex items-center justify-between py-2">
          <span className="text-body text-rsl-black">Push Notifications</span>
          <Switch checked={push} onCheckedChange={togglePush} />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-body text-rsl-black">Email Notifications</span>
          <Switch checked={email} onCheckedChange={toggleEmail} />
        </div>
      </div>

      {/* Company info */}
      <div className="rounded-card bg-[#fdf3e0] p-4 lg:p-5">
        <p className="mb-3 text-section-label uppercase text-[#8a5a00]">Rosal Safety Private Limited</p>
        <div className="space-y-2 text-body text-[#5c3d00]">
          <div className="flex justify-between"><span>Company</span><span className="text-right">{company?.name ?? "—"}</span></div>
          <div className="flex justify-between"><span>GSTIN</span><span>{company?.gstin ?? "—"}</span></div>
          <div className="flex justify-between gap-4"><span>Address</span><span className="text-right">{company?.address ?? "—"}</span></div>
        </div>
        {showCompanySettingsLink && (
          <Link href="/admin/company-settings" className="mt-3 inline-block">
            <Button variant="outline" size="sm">Edit Company Details</Button>
          </Link>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Link href="/change-password">
          <Button variant="outline" size="block">Change Password</Button>
        </Link>
        <Button variant="outline-red" size="block" onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}
