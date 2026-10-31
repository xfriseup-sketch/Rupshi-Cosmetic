import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  passwordsMatch,
  sessionCookieOptions,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "Admin password is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await passwordsMatch(password))) {
    return NextResponse.json(
      { success: false, message: "Incorrect password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, await createSessionToken(), sessionCookieOptions());
  return response;
}
