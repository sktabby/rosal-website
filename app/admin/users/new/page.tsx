"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import PageHeader from "@/components/shared/PageHeader";
import SimpleSelect from "@/components/shared/SimpleSelect";
import { checkEmployeeCode, createUser } from "@/lib/api/users";
import { ApiError } from "@/lib/api/http";
import { UserRole } from "@/lib/enums";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: UserRole.SELLER, label: "Seller" },
  { value: UserRole.DISPATCHER, label: "Dispatcher" },
  { value: UserRole.ACCOUNTS, label: "Accounts" },
];

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function UserCreationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    role: "" as string,
    employeeCode: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingCode, setCheckingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  /**
   * reCAPTCHA tokens are single-use and expire after ~2 minutes, so the widget
   * has to be cleared whenever a submit doesn't go through — otherwise the
   * next attempt replays a spent token and the backend rejects it.
   */
  function resetCaptcha() {
    recaptchaRef.current?.reset();
    setCaptchaToken(null);
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleCodeBlur() {
    if (!form.employeeCode) return;
    setCheckingCode(true);
    try {
      const res = await checkEmployeeCode(form.employeeCode);
      if (!res.available) {
        setErrors((e) => ({ ...e, employeeCode: "This Employee Code is already in use (or was previously)." }));
      }
    } catch {
      // Non-blocking: if the check endpoint hiccups, server-side validation on submit still catches it.
    } finally {
      setCheckingCode(false);
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.role) next.role = "Select a role.";
    if (!form.employeeCode) next.employeeCode = "Required.";
    if (!form.firstName) next.firstName = "Required.";
    if (!form.lastName) next.lastName = "Required.";
    if (!form.phone) next.phone = "Required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    if (form.password.length < 8) next.password = "Minimum 8 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    if (!captchaToken) next.captcha = "Complete the captcha to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createUser({
        role: form.role as UserRole,
        employeeCode: form.employeeCode,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        captchaToken: captchaToken as string, // validate() guarantees this is set
      });
      toast.success(`User created — credentials emailed to ${form.email}`);
      router.push("/admin/management");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create user.");
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  }

  const idPreview =
    form.firstName && form.employeeCode.length >= 5
      ? `${form.firstName.toUpperCase()}-${form.employeeCode.slice(-5)}`
      : "—";

  return (
    <div>
      <PageHeader title="Create User" description="Only Admin can create Seller, Dispatcher, or Accounts accounts." />

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-card border border-rsl-border bg-white p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-x-4 lg:grid-cols-2">
          <FormField label="Role" required error={errors.role}>
            <SimpleSelect value={form.role} onChange={(v) => set("role", v)} options={ROLE_OPTIONS} error={!!errors.role} />
          </FormField>
          <FormField label="Employee Code" required error={errors.employeeCode} hint={checkingCode ? "Checking availability..." : undefined}>
            <Input
              placeholder="Unique — checked live against DB"
              value={form.employeeCode}
              onChange={(e) => set("employeeCode", e.target.value)}
              onBlur={handleCodeBlur}
              error={!!errors.employeeCode}
            />
          </FormField>
          <FormField label="First Name" required error={errors.firstName}>
            <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} error={!!errors.firstName} />
          </FormField>
          <FormField label="Last Name" required error={errors.lastName}>
            <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} error={!!errors.lastName} />
          </FormField>
          <FormField label="Phone" required error={errors.phone}>
            <Input placeholder="+91" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={!!errors.phone} />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} error={!!errors.email} />
          </FormField>
          <FormField label="Password" required error={errors.password}>
            <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} error={!!errors.password} />
          </FormField>
          <FormField label="Confirm Password" required error={errors.confirmPassword}>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              error={!!errors.confirmPassword}
            />
          </FormField>
        </div>

        <FormField
          label="Captcha"
          required
          error={errors.captcha}
          hint={RECAPTCHA_SITE_KEY ? undefined : "NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set."}
        >
          {RECAPTCHA_SITE_KEY ? (
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => {
                setCaptchaToken(token);
                setErrors((e) => ({ ...e, captcha: "" }));
              }}
              // Google expires an unused token after ~2 minutes; drop it so a
              // stale token is never submitted.
              onExpired={() => setCaptchaToken(null)}
              onErrored={() => setCaptchaToken(null)}
            />
          ) : (
            <p className="text-[11.5px] text-rsl-red">
              Captcha can&apos;t load — the site key is missing from this environment.
            </p>
          )}
        </FormField>

        <div className="mt-2 rounded-field bg-[#fdf3e0] px-3 py-2.5 text-[11.5px] text-[#8a5a00]">
          Generated Seller/Dispatcher ID preview: <span className="font-bold">{idPreview}</span>{" "}
          (First name + last 5 digits of employee code — stored as the primary identifier)
        </div>

        <Button type="submit" variant="red" size="block" loading={loading} className="mt-5 lg:w-auto">
          Create User
        </Button>
      </form>
    </div>
  );
}
