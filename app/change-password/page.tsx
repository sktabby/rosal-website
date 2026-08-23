"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { changePassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = "Enter your current password.";
    if (newPassword.length < 8) next.newPassword = "Minimum 8 characters.";
    if (confirmPassword !== newPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setErrors({ currentPassword: "Current password is incorrect." });
      } else {
        toast.error(err instanceof ApiError ? err.message : "Couldn't update password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rsl-bg px-4 py-10">
      <div className="w-full max-w-[400px] rounded-card border border-rsl-border bg-white p-6 shadow-card">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-meta text-rsl-muted hover:text-rsl-black"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <h1 className="text-page-title-lg text-rsl-black mb-5">Change Password</h1>

        <form onSubmit={handleSubmit}>
          <FormField label="Current Password" error={errors.currentPassword}>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={!!errors.currentPassword}
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="New Password" hint="Minimum 8 characters." error={errors.newPassword}>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!errors.newPassword}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm New Password" error={errors.confirmPassword}>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              autoComplete="new-password"
            />
          </FormField>

          <Button type="submit" variant="black" size="block" loading={loading} className="mt-2">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
