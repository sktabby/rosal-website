"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyOtp, resendOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/http";
import { getPendingEmployeeCode, roleHomePath, setSession } from "@/lib/session";
import { useSession } from "@/providers/SessionProvider";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const employeeCode = typeof window !== "undefined" ? getPendingEmployeeCode() : undefined;

  useEffect(() => {
    if (!employeeCode) {
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function updateDigit(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    if (value && index === OTP_LENGTH - 1 && next.every((d) => d)) {
      submit(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function submit(otp: string) {
    if (!employeeCode) return;
    setError(null);
    setLoading(true);
    try {
      const res = await verifyOtp(employeeCode, otp);
      setSession(res.accessToken, res.role);
      await refresh();
      router.push(roleHomePath(res.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid OTP. Try again.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!employeeCode || seconds > 0) return;
    setResending(true);
    try {
      await resendOtp(employeeCode);
      setSeconds(RESEND_SECONDS);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't resend OTP. Try again shortly.");
    } finally {
      setResending(false);
    }
  }

  const otpValue = digits.join("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="w-full max-w-[360px] text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf3e0]">
          <Mail className="h-6 w-6 text-rsl-amber" />
        </div>
        <h1 className="text-[20px] font-bold text-rsl-black">Verify OTP</h1>
        <p className="mt-1 text-body-md text-rsl-muted">Sent to your registered email and phone</p>

        <div className="mt-6 flex justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className={cn(
                "h-11 w-9 rounded-field border-[1.4px] text-center text-[16px] font-bold text-rsl-black focus:outline-none",
                d ? "border-rsl-red" : "border-rsl-border"
              )}
            />
          ))}
        </div>

        {error && <p className="mt-3 text-[11px] text-rsl-red">{error}</p>}

        <Button
          className="mt-6"
          variant="black"
          size="block"
          loading={loading}
          disabled={otpValue.length < 4}
          onClick={() => submit(otpValue)}
        >
          Verify & Login
        </Button>

        <div className="mt-4 text-[11px]">
          {seconds > 0 ? (
            <span className="text-rsl-muted">Resend OTP in 00:{String(seconds).padStart(2, "0")}</span>
          ) : (
            <button onClick={handleResend} disabled={resending} className="font-bold text-rsl-red hover:underline">
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
