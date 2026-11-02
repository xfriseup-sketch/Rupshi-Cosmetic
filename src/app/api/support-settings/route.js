import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import SiteSettings from "@/models/SiteSettings";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_SUPPORT_SETTINGS = {
  whatsappNumber: "",
  facebookPageUrl: "",
  supportEmail: "",
  isActive: true,
};

async function isAdminAuthenticated(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return token ? verifySessionToken(token) : false;
}

function validateSupportSettings(body) {
  const fields = ["whatsappNumber", "facebookPageUrl", "supportEmail"];
  for (const field of fields) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return `${field} must be a string`;
    }
  }
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return "isActive must be a boolean";
  }
  if (body.facebookPageUrl) {
    try {
      const url = new URL(body.facebookPageUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      return "facebookPageUrl must be a valid HTTP or HTTPS URL";
    }
  }
  if (body.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.supportEmail)) {
    return "supportEmail must be a valid email address";
  }
  return null;
}

export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SUPPORT_SETTINGS,
        dbConfigured: false,
      });
    }

    const settings = await SiteSettings.findOne({ key: "global" })
      .select("whatsappNumber facebookPageUrl supportEmail isActive")
      .lean();

    return NextResponse.json(
      {
        success: true,
        settings: settings
          ? {
              whatsappNumber: settings.whatsappNumber || "",
              facebookPageUrl: settings.facebookPageUrl || "",
              supportEmail: settings.supportEmail || "",
              isActive: settings.isActive ?? true,
            }
          : DEFAULT_SUPPORT_SETTINGS,
        dbConfigured: true,
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("Support settings GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch support settings" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const validationError = validateSupportSettings(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const update = {};
    for (const field of ["whatsappNumber", "facebookPageUrl", "supportEmail", "isActive"]) {
      if (body[field] !== undefined) update[field] = body[field];
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid settings provided" },
        { status: 400 }
      );
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: "global" },
      { $set: update, $setOnInsert: { key: "global" } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
      .select("whatsappNumber facebookPageUrl supportEmail isActive")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Support settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error("Support settings POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save support settings" },
      { status: 500 }
    );
  }
}
