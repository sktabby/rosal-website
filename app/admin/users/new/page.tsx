"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormSection } from "@/components/shared/FormField";
import PageHeader from "@/components/shared/PageHeader";
import SimpleSelect from "@/components/shared/SimpleSelect";
import { checkEmployeeCode, createUser } from "@/lib/api/users";
import { ApiError } from "@/lib/api/http";
import { UserRole } from "@/lib/enums";
import { toast } from "sonner";
import { useTheme } from "@/providers/ThemeProvider";

const ROLE_OPTIONS = [
  { value: UserRole.SELLER, label: "Seller" },
  { value: UserRole.DISPATCHER, label: "Dispatcher" },
  { value: UserRole.ACCOUNTS, label: "Accounts" },
];

// Employee Code is always RS + a 4-digit number + this role letter, e.g. "RS0001S" —
// the admin only ever types the number; RS and the letter are applied automatically.
const ROLE_CODE_SUFFIX: Record<string, string> = {
  [UserRole.SELLER]: "S",
  [UserRole.DISPATCHER]: "D",
  [UserRole.ACCOUNTS]: "A",
};

function buildEmployeeCode(role: string, digits: string): string {
  if (!role || !digits) return "";
  return `RS${digits.padStart(4, "0")}${ROLE_CODE_SUFFIX[role]}`;
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const EMAIL_ERROR = "Enter a valid email address (e.g. name@company.com).";

export default function UserCreationPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [form, setForm] = useState({
    role: "" as string,
    // Just the digits the admin types — RS prefix and role-letter suffix are applied
    // automatically wherever the full code is needed (see buildEmployeeCode).
    employeeNumber: "",
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

  // A theme switch remounts the widget unticked; drop the token to match.
  useEffect(() => {
    setCaptchaToken(null);
  }, [resolvedTheme]);

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
    if (key === "employeeNumber" || key === "role") setCodeAvailable(false);
  }

  function setEmployeeNumber(raw: string) {
    // Numeric only, capped at 4 digits — RS and the role letter are never typed.
    set("employeeNumber", raw.replace(/\D/g, "").slice(0, 4));
  }

  async function handleCodeBlur() {
    const code = buildEmployeeCode(form.role, form.employeeNumber);
    if (!code) return;
    setCheckingCode(true);
    try {
      const res = await checkEmployeeCode(code);
      setCodeAvailable(res.available);
      if (!res.available) {
        setErrors((e) => ({ ...e, employeeNumber: "This Employee Code is already in use (or was previously)." }));
      }
    } catch {
      // Non-blocking: if the check endpoint hiccups, server-side validation on submit still catches it.
    } finally {
      setCheckingCode(false);
    }
  }

  function handleEmailBlur() {
    if (form.email && !EMAIL_REGEX.test(form.email)) {
      setErrors((e) => ({ ...e, email: EMAIL_ERROR }));
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.role) next.role = "Select a role.";
    if (!form.employeeNumber) next.employeeNumber = "Required.";
    if (!form.firstName) next.firstName = "Required.";
    if (!form.lastName) next.lastName = "Required.";
    if (!form.phone) next.phone = "Required.";
    if (!EMAIL_REGEX.test(form.email)) next.email = EMAIL_ERROR;
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
        employeeCode: buildEmployeeCode(form.role, form.employeeNumber),
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

  const employeeCode = buildEmployeeCode(form.role, form.employeeNumber);
  // Mirrors the backend's generateDisplayId exactly: digits only, last 5, zero-padded.
  const idPreview =
    form.firstName && employeeCode
      ? `${form.firstName.toUpperCase()}-${form.employeeNumber.padStart(5, "0")}`
      : "—";

  const codeHint = checkingCode
    ? "Checking availability..."
    : codeAvailable
      ? "Available."
      : "Must be unique — checked against the directory.";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Create New User"
        description="New user will receive their credentials on email!"
        backHref="/admin/home"
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-card border border-rsl-border bg-surface p-4 shadow-card sm:p-5 lg:p-6"
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
            <FormField
              label="Employee Code"
              required
              error={errors.employeeNumber}
              hint={form.role ? codeHint : "Select a role first."}
            >
              <div className="flex items-stretch">
                <span className="flex items-center rounded-l-field border-[1.4px] border-r-0 border-rsl-border bg-rsl-bg px-3 text-body font-bold text-rsl-muted">
                  RS
                </span>
                <Input
                  inputMode="numeric"
                  placeholder="0001"
                  maxLength={4}
                  value={form.employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  onBlur={handleCodeBlur}
                  error={!!errors.employeeNumber}
                  className="rounded-none text-center"
                  disabled={!form.role}
                />
                <span className="flex items-center rounded-r-field border-[1.4px] border-l-0 border-rsl-border bg-rsl-bg px-3 text-body font-bold text-rsl-muted">
                  {form.role ? ROLE_CODE_SUFFIX[form.role] : "–"}
                </span>
              </div>
            </FormField>
          </div>

          <div className="rounded-field border border-rsl-amber/40 bg-notice-bg px-3.5 py-3">
            <p className="text-section-label uppercase text-notice-fg">Generated ID preview</p>
            <p className="mt-1 text-body-md font-bold text-notice-fg">
              {employeeCode || "—"} {idPreview !== "—" && `· ${idPreview}`}
            </p>
            <p className="mt-1 text-meta leading-snug text-notice-fg/80">
              Employee Code: RS + the number above + a role letter (S seller, D dispatcher, A
              accounts), always applied automatically. The generated ID is first name + the last
              5 digits, stored as the primary identifier.
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
                onBlur={handleEmailBlur}
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
              <Input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                error={!!errors.password}
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Confirm Password" required error={errors.confirmPassword}>
              <Input
                type="password"
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
                  // The widget reads `theme` only on mount, so remount on change.
                  // Remounting also discards any token, which the user re-ticks.
                  key={resolvedTheme}
                  theme={resolvedTheme}
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
