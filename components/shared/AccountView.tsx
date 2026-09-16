"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, KeyRound, LogOut, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/shared/FormField";
import { getCompanySettings } from "@/lib/api/companySettings";
import { updateNotificationPrefs } from "@/lib/api/auth";
import { updateUser } from "@/lib/api/users";
import { useSession } from "@/providers/SessionProvider";
import { fullName, initials, formatDateTime, cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

interface AccountViewProps {
  showEdit?: boolean;
  showCompanySettingsLink?: boolean;
  factoryUnitName?: string;
  roleIdLabel: string;
}

function Panel({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-card border border-rsl-border bg-white p-4 shadow-card lg:p-5", className)}>
      <div className="mb-3 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-rsl-muted" />}
        <h3 className="text-section-label uppercase text-rsl-muted">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f2f2f2] py-2.5 last:border-0 last:pb-0">
      <span className="shrink-0 text-body text-rsl-muted">{label}</span>
      <span className="text-right text-body text-rsl-black">{value}</span>
    </div>
  );
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
      await updateUser(currentUser.id, editForm);
      await refresh();
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      {/* Identity */}
      <section className="overflow-hidden rounded-card border border-rsl-border bg-white shadow-card">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center lg:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rsl-amber to-rsl-orange text-[20px] font-bold text-rsl-black">
              {initials(currentUser)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-bold text-rsl-black">{fullName(currentUser)}</p>
              <p className="mt-0.5 truncate text-meta text-rsl-muted">
                {roleIdLabel} · {currentUser.employeeCode}
              </p>
              <p className="truncate text-meta text-rsl-muted">
                {[currentUser.email, currentUser.phone].filter(Boolean).join("  ·  ") || "—"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {factoryUnitName && (
              <span className="inline-flex items-center rounded-full bg-rsl-bg px-2.5 py-1 text-[10.5px] font-bold text-rsl-muted">
                {factoryUnitName}
              </span>
            )}
            <Badge className="bg-status-done-bg text-status-done-fg">
              {currentUser.status === "DEACTIVATED" ? "Deactivated" : "Active"}
            </Badge>
            {showEdit && !editing && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>
        </div>

        {editing && (
          <div className="border-t border-rsl-border bg-rsl-bg-soft p-4 lg:p-5">
            <h3 className="mb-3 text-section-label uppercase text-rsl-muted">Edit Profile</h3>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FormField label="First Name">
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                  autoComplete="given-name"
                />
              </FormField>
              <FormField label="Last Name">
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                  autoComplete="family-name"
                />
              </FormField>
              <FormField label="Phone">
                <Input
                  type="tel"
                  inputMode="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  autoComplete="tel"
                />
              </FormField>
              <FormField label="Email" className="mb-0">
                <Input
                  type="email"
                  inputMode="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </FormField>
            </div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setEditing(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="red" loading={saving} onClick={saveEdit} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Session Info">
          <DetailRow label="Last Login" value={formatDateTime(currentUser.lastLoginAt)} />
          <DetailRow label="Device" value={currentUser.lastLoginDevice ?? "—"} />
          <DetailRow
            label="Session Status"
            value={<Badge className="bg-status-done-bg text-status-done-fg">Active</Badge>}
          />
        </Panel>

        <Panel title="Notifications">
          <div className="flex items-start justify-between gap-4 border-b border-[#f2f2f2] py-2.5">
            <div className="min-w-0">
              <p className="text-body text-rsl-black">Push Notifications</p>
              <p className="mt-0.5 text-meta text-rsl-muted">Order and bill activity on your device.</p>
            </div>
            <Switch checked={push} onCheckedChange={togglePush} />
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <div className="min-w-0">
              <p className="text-body text-rsl-black">Email Notifications</p>
              <p className="mt-0.5 text-meta text-rsl-muted">The same updates, sent to your inbox.</p>
            </div>
            <Switch checked={email} onCheckedChange={toggleEmail} />
          </div>
        </Panel>
      </div>

      <Panel title="Company" icon={Building2}>
        <DetailRow label="Name" value={company?.name ?? "—"} />
        <DetailRow label="GSTIN" value={company?.gstin ?? "—"} />
        <DetailRow label="Address" value={company?.address ?? "—"} />
        {showCompanySettingsLink && (
          <Link href="/admin/company-settings" className="mt-3 inline-block">
            <Button variant="outline" size="sm">Edit Company Details</Button>
          </Link>
        )}
      </Panel>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/change-password" className="sm:flex-1">
          <Button variant="outline" size="block">
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
        </Link>
        <Button variant="outline-red" size="block" onClick={logout} className="sm:flex-1">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
