import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/otp"];

const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "ADMIN",
  "/dispatcher": "DISPATCHER",
  "/accounts": "ACCOUNTS",
};

// Mirrors lib/session.ts's WEB_PORTAL_ROLES — kept separate since middleware
// runs on the edge runtime and can't import client-only cookie helpers.
const WEB_PORTAL_ROLES = new Set(["ADMIN", "DISPATCHER", "ACCOUNTS"]);

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

/**
 * A token can exist for a role with no web portal (e.g. Seller, or a stray
 * cookie from before this check existed). Rather than bounce it to roleHome,
 * which is "/login" for these roles and looks like a silent, unexplained
 * failure, clear it here and say why.
 */
function noPortalAccessRedirect(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login?reason=no-portal-access", request.url));
  res.cookies.delete("rsl_token");
  res.cookies.delete("rsl_role");
  return res;
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
    if (!role || !WEB_PORTAL_ROLES.has(role)) return noPortalAccessRedirect(request);
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!role || !WEB_PORTAL_ROLES.has(role)) {
    return noPortalAccessRedirect(request);
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
