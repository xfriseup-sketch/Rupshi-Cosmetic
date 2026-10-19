import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import SiteSettings, { DEFAULT_SETTINGS } from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

/**
 * Ensure a singleton settings document exists and return it as a plain object.
 */
async function getOrCreateSettings() {
  let doc = await SiteSettings.findOne({ key: "global" }).lean();
  if (!doc) {
    const created = await SiteSettings.create({ key: "global", ...DEFAULT_SETTINGS });
    doc = created.toObject();
  }
  // Strip internal fields
  const { _id, __v, key, createdAt, updatedAt, ...settings } = doc;
  return settings;
}

/**
 * GET /api/settings
 * Returns current site settings. Falls back to defaults if DB unavailable.
 */
export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SETTINGS,
        dbConfigured: false,
      });
    }

    const settings = await getOrCreateSettings();
    return NextResponse.json({ success: true, settings, dbConfigured: true });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      {
        success: true,
        settings: DEFAULT_SETTINGS,
        message: error?.message || "Using defaults",
      },
      { status: 200 }
    );
  }
}

/**
 * PUT /api/settings
 * Updates site settings (partial update supported).
 * Body: partial settings object matching the schema shape.
 */
export async function PUT(request) {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    // Allowed top-level keys only
    const allowed = [
      "noticeBar",
      "heroSection",
      "categoriesSection",
      "bestSellersSection",
      "hotOffersSection",
      "promoBanner",
      "newArrivalsSection",
      "reviewsSection",
      "whyChooseUsSection",
    ];

    const update = {};
    for (const key of allowed) {
      if (body[key] !== undefined && typeof body[key] === "object") {
        update[key] = body[key];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid settings provided" },
        { status: 400 }
      );
    }

    // Upsert singleton document
    const doc = await SiteSettings.findOneAndUpdate(
      { key: "global" },
      { $set: update },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    const { _id, __v, key, createdAt, updatedAt, ...settings } = doc;

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
