import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";

function isPublicWrite(pathname, method) {
  if (method !== "POST") return false;
  return (
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout" ||
    pathname === "/api/orders" ||
    pathname === "/api/coupons/validate"
  );
}

function isSensitiveGet(pathname) {
  if (pathname === "/api/orders" || pathname === "/api/coupons") return true;
  return pathname.startsWith("/api/orders/") && pathname.endsWith("/invoice");
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  if (pathname.startsWith("/admin")) {
    const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
    if (isLogin) {
      if (authed) return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.next();
    }
    if (!authed) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if (isPublicWrite(pathname, method)) return NextResponse.next();

  const needsAuth = (method !== "GET" && method !== "HEAD") || isSensitiveGet(pathname);
  if (!needsAuth || authed) return NextResponse.next();

  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 }
  );
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*"],
};
