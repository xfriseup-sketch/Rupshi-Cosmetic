import { NextResponse } from "next/server";
import { ADMIN_COOKIE, sessionCookieOptions } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, "", sessionCookieOptions(0));
  return response;
}
