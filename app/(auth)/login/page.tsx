

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RosalLockup, RosalMark } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api/auth";
import { getCompanySettings } from "@/lib/api/companySettings";
import { ApiError } from "@/lib/api/http";
import { setPendingEmployeeCode } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: company } = useQuery({
    queryKey: ["company-settings", "public"],
    queryFn: getCompanySettings,
    retry: 0,
    staleTime: Infinity,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!employeeCode || !password) {
      setError("Enter your Employee Code and Password.");
      return;
    }
    setLoading(true);
    try {
      await login(employeeCode, password);
      setPendingEmployeeCode(employeeCode);
      router.push("/otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const companyName = company?.name ?? "Rosal Safety Private Limited";
  const companyAddress =
    company?.address ??
    "Godown 1876, Ram Avtar Compound, Shelar Road, Bhiwandi, Thane - 421302, Maharashtra";
  const companyGstin = company?.gstin ?? "27AANCR7712A1ZF";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-rsl-black via-[#3a0c0e] to-rsl-red lg:flex lg:w-[460px] lg:flex-col lg:justify-between">
        {/* Mobile / tablet: single-row header, logo left, company info right */}
        <div className="flex items-center gap-3 px-4 py-3 lg:hidden">
          <RosalMark size={44} className="shrink-0" />
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[11px] font-bold uppercase tracking-wide text-white">
              {companyName}
            </p>
            <p className="text-[9.5px] leading-tight text-white/70">{companyAddress}</p>
            <p className="text-[9.5px] leading-tight text-white/50">
              GSTIN: <span className="text-white/80">{companyGstin}</span>
            </p>
          </div>
        </div>

        {/* Desktop: taller stacked layout; the lockup already carries the wordmark */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:items-center lg:justify-center lg:px-6">
          <RosalLockup width={260} />
        </div>
        <div className="hidden border-t border-white/10 bg-black/15 px-10 py-6 backdrop-blur-sm lg:block">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/50">
            {companyName}
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/70">{companyAddress}</p>
          <p className="mt-1.5 text-[11px] text-white/50">
            GSTIN: <span className="text-white/80">{companyGstin}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-5 py-10 sm:px-8">
        <div className="w-full max-w-[360px]">
          <h1 className="text-[20px] font-bold text-rsl-black">Login Here!</h1>
          <p className="mt-1 text-body-md text-rsl-muted">Sign in with your Employee Code</p>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="mb-3">
              <Label htmlFor="employeeCode">Employee Code</Label>
              <Input
                id="employeeCode"
                placeholder="e.g. AMIT-27891"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                autoComplete="username"
                error={!!error}
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                error={!!error}
              />
            </div>
            {error && <p className="mb-3 text-[11px] text-rsl-red">{error}</p>}

            <Button type="submit" variant="red" size="block" loading={loading} className="mt-3">
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-[11px] text-rsl-muted">
            Forgot password? Contact system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

