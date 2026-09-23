import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// Protected route prefixes mapped to the role(s) allowed to access them
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_ROUTES = [
  { prefix: "/super-admin", allowedRoles: ["SuperAdmin"] },
  { prefix: "/admin", allowedRoles: ["Admin"] },
  { prefix: "/employee", allowedRoles: ["Employee"] },
  { prefix: "/hr", allowedRoles: ["HR", "Head_of_HR", "HR_Manager"] },
  { prefix: "/manager", allowedRoles: ["Manager"] },
  // Generic /dashboard accessible by anyone signed in
  { prefix: "/dashboard", allowedRoles: ["*"] },
];

// Paths that don't require any auth check
const PUBLIC_PATHS = ["/signin", "/signup", "/forgot-password", "/reset-password"];

export function middleware(req) {
  const path = req.nextUrl.pathname;

  // Skip middleware on public routes
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Find the matching protected prefix (if any)
  const matched = ROLE_ROUTES.find((r) => path.startsWith(r.prefix));

  // Not a protected route → let it through
  if (!matched) {
    return NextResponse.next();
  }

  // Read auth state from cookies
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  // 1. No token → redirect to signin with `next` param so they bounce back after login
  if (!token) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("next", path);
    return NextResponse.redirect(signInUrl);
  }

  // 2. Wildcard route — any signed-in user allowed
  if (matched.allowedRoles.includes("*")) {
    return NextResponse.next();
  }

  // 3. Role check — redirect to their own portal if mismatched
  if (!matched.allowedRoles.includes(role)) {
    const ownPortal = roleToHomePath(role);
    return NextResponse.redirect(new URL(ownPortal, req.url));
  }

  return NextResponse.next();
}

// Map a role to where they should land if they try to access something else
function roleToHomePath(role) {
  switch (role) {
    case "SuperAdmin":
      return "/super-admin/today";
    case "Admin":
      return "/admin/today";
    case "Employee":
      return "/employee/today";
    case "HR":
    case "Head_of_HR":
    case "HR_Manager":
      return "/hr/today";
    case "Manager":
      return "/manager/today";
    default:
      return "/signin";
  }
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/employee/:path*",
    "/hr/:path*",
    "/manager/:path*",
    "/dashboard/:path*",
  ],
};