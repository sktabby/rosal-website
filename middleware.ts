import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/otp"];

const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "ADMIN",
  "/dispatcher": "DISPATCHER",
  "/accounts": "ACCOUNTS",
};

function roleHome(role?: string) {
  switch (role) {
    case "ADMIN":
      return "/admin/home";
    case "DISPATCHER":
      return "/dispatcher/queue";
    case "ACCOUNTS":
      return "/accounts/bills";
    default:
      return "/login";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|gif)$/) ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("rsl_token")?.value;
  const role = request.cookies.get("rsl_role")?.value;

  if (pathname === "/") {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // change-password is shared across all roles — only requires being logged in.
  if (pathname.startsWith("/change-password")) {
    return NextResponse.next();
  }

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((p) => pathname.startsWith(p));
  if (matchedPrefix && role !== ROLE_PREFIXES[matchedPrefix]) {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.(?:png|jpg|jpeg|svg|ico|webp|gif)$).*)"],
};
