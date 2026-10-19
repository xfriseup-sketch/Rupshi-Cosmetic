import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import SiteSettings, { DEFAULT_SETTINGS } from "@/models/SiteSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function deepMergeSettings(dbDoc) {
  const out = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  if (!dbDoc || typeof dbDoc !== "object") return out;
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (dbDoc[key] != null && typeof dbDoc[key] === "object") {
      out[key] = { ...out[key], ...dbDoc[key] };
    }
  }
  return out;
}

async function getOrCreateSettings() {
  let doc = await SiteSettings.findOne({ key: "global" }).lean();
  if (!doc) {
    const created = await SiteSettings.create({
      key: "global",
      ...DEFAULT_SETTINGS,
    });
    doc = created.toObject();
  }
  const { _id, __v, key, createdAt, updatedAt, ...rest } = doc;
  return deepMergeSettings(rest);
}

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
    return NextResponse.json(
      { success: true, settings, dbConfigured: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      message: error?.message || "Using defaults",
    });
  }
}

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

    // Build $set with dotted paths so partial nested updates merge correctly
    const $set = {};
    for (const key of allowed) {
      if (body[key] !== undefined && typeof body[key] === "object" && body[key] !== null) {
        for (const [field, value] of Object.entries(body[key])) {
          $set[`${key}.${field}`] = value;
        }
      }
    }

    if (Object.keys($set).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid settings provided" },
        { status: 400 }
      );
    }

    // Ensure singleton exists first
    await SiteSettings.findOneAndUpdate(
      { key: "global" },
      { $setOnInsert: { key: "global", ...DEFAULT_SETTINGS } },
      { upsert: true }
    );

    const doc = await SiteSettings.findOneAndUpdate(
      { key: "global" },
      { $set },
      { new: true, runValidators: true }
    ).lean();

    const { _id, __v, key, createdAt, updatedAt, ...rest } = doc || {};
    const settings = deepMergeSettings(rest);

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
