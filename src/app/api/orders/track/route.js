import { NextResponse } from "next/server";
import { lookupPublicOrder } from "@/lib/trackOrder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await lookupPublicOrder({
      id: searchParams.get("id") || "",
      phone: searchParams.get("phone") || "",
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error },
        {
          status: result.status || 400,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    return NextResponse.json(
      { success: true, order: result.order },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { success: false, message: "Could not look up this order" },
      { status: 500 }
    );
  }
}
