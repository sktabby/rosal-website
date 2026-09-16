"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { FormField, FormSection } from "@/components/shared/FormField";
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

function PasswordInput(props: InputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-rsl-muted transition-colors hover:text-rsl-black"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

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
  const [codeAvailable, setCodeAvailable] = useState(false);
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
    if (key === "employeeCode") setCodeAvailable(false);
  }

  async function handleCodeBlur() {
    if (!form.employeeCode) return;
    setCheckingCode(true);
    try {
      const res = await checkEmployeeCode(form.employeeCode);
      setCodeAvailable(res.available);
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

  const codeHint = checkingCode
    ? "Checking availability..."
    : codeAvailable
      ? "Available."
      : "Must be unique — checked against the directory.";

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Create User"
        description="Only Admin can create Seller, Dispatcher, or Accounts accounts."
        backHref="/admin/home"
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-card border border-rsl-border bg-white p-4 shadow-card sm:p-5 lg:p-6"
      >
        <FormSection title="Role & Access" description="Determines which portal this person signs in to.">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField label="Role" required error={errors.role}>
              <SimpleSelect
                value={form.role}
                onChange={(v) => set("role", v)}
                options={ROLE_OPTIONS}
                error={!!errors.role}
              />
            </FormField>
            <FormField label="Employee Code" required error={errors.employeeCode} hint={codeHint}>
              <Input
                placeholder="e.g. AMIT-27891"
                value={form.employeeCode}
                onChange={(e) => set("employeeCode", e.target.value)}
                onBlur={handleCodeBlur}
                error={!!errors.employeeCode}
              />
            </FormField>
          </div>

          <div className="rounded-field border border-rsl-amber/40 bg-[#fdf3e0] px-3.5 py-3">
            <p className="text-section-label uppercase text-[#8a5a00]">Generated ID preview</p>
            <p className="mt-1 text-body-md font-bold text-[#8a5a00]">{idPreview}</p>
            <p className="mt-1 text-meta leading-snug text-[#8a5a00]/80">
              First name + last 5 digits of the employee code. Stored as the primary identifier.
            </p>
          </div>
        </FormSection>

        <FormSection title="Personal Details" description="Login credentials are emailed to this address.">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField label="First Name" required error={errors.firstName}>
              <Input
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                error={!!errors.firstName}
                autoComplete="given-name"
              />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName}>
              <Input
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                error={!!errors.lastName}
                autoComplete="family-name"
              />
            </FormField>
            <FormField label="Phone" required error={errors.phone}>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="+91"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                error={!!errors.phone}
                autoComplete="tel"
              />
            </FormField>
            <FormField label="Email" required error={errors.email}>
              <Input
                type="email"
                inputMode="email"
                placeholder="name@rosalsafety.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={!!errors.email}
                autoComplete="email"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Security" description="The user is asked to change this after their first sign-in.">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField
              label="Password"
              required
              error={errors.password}
              hint="Minimum 8 characters."
            >
              <PasswordInput
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                error={!!errors.password}
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Confirm Password" required error={errors.confirmPassword}>
              <PasswordInput
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                error={!!errors.confirmPassword}
                autoComplete="new-password"
              />
              {form.confirmPassword.length > 0 && form.confirmPassword === form.password && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-status-done-fg">
                  <Check className="h-3.5 w-3.5" />
                  Passwords match.
                </p>
              )}
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Verification">
          <FormField
            label="Captcha"
            required
            error={errors.captcha}
            hint={RECAPTCHA_SITE_KEY ? undefined : "NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set."}
            className="mb-0"
          >
            {RECAPTCHA_SITE_KEY ? (
              <div className="origin-top-left scale-[0.85] sm:scale-100">
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
              </div>
            ) : (
              <p className="text-[11.5px] text-rsl-red">
                Captcha can&apos;t load — the site key is missing from this environment.
              </p>
            )}
          </FormField>
        </FormSection>

        <div className="flex flex-col-reverse gap-2 border-t border-rsl-border pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" variant="red" loading={loading} className="w-full sm:w-auto">
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
}
