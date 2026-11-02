import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import SiteSettings from "@/models/SiteSettings";
import {
  ADMIN_COOKIE,
  verifySessionToken,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_SUPPORT_SETTINGS = {
  whatsappNumber: "",
  facebookPageUrl: "",
  supportEmail: "",
  isActive: true,
};

/**
 * Check the signed admin session cookie.
 * Do not trust cookie presence alone.
 */
async function isAdminAuthenticated(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!token) return false;

  return await verifySessionToken(token);
}

/**
 * GET /api/support-settings
 * Fetch active support settings.
 */
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

    const settings = await SiteSettings.findOne({
      key: "global",
      isActive: true,
    })
      .select(
        "whatsappNumber facebookPageUrl supportEmail isActive"
      )
      .lean();

    return NextResponse.json(
      {
        success: true,
        settings: settings
          ? {
              whatsappNumber: settings.whatsappNumber || "",
              facebookPageUrl: settings.facebookPageUrl || "",
              supportEmail: settings.supportEmail || "",
              isActive: settings.isActive,
            }
          : DEFAULT_SUPPORT_SETTINGS,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Support settings GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch support settings",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/support-settings
 * Create or update the global support settings.
 */
export async function POST(request) {
  try {
    // Additional route-level authentication
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin login required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const updateData = {};

    if (body.whatsappNumber !== undefined) {
      if (typeof body.whatsappNumber !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "WhatsApp number must be a string",
          },
          { status: 400 }
        );
      }

      updateData.whatsappNumber = body.whatsappNumber.trim();
    }

    if (body.facebookPageUrl !== undefined) {
      if (typeof body.facebookPageUrl !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Facebook URL must be a string",
          },
          { status: 400 }
        );
      }

      const url = body.facebookPageUrl.trim();

      if (url) {
        try {
          const parsed = new URL(url);

          if (
            parsed.protocol !== "https:" &&
            parsed.protocol !== "http:"
          ) {
            throw new Error("Invalid protocol");
          }
        } catch {
          return NextResponse.json(
            {
              success: false,
              message: "Please provide a valid Facebook page URL",
            },
            { status: 400 }
          );
        }
      }

      updateData.facebookPageUrl = url;
    }

    if (body.supportEmail !== undefined) {
      if (typeof body.supportEmail !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Support email must be a string",
          },
          { status: 400 }
        );
      }

      const email = body.supportEmail.trim().toLowerCase();

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Please provide a valid support email",
          },
          { status: 400 }
        );
      }

      updateData.supportEmail = email;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "isActive must be a boolean",
          },
          { status: 400 }
        );
      }

      updateData.isActive = body.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid settings provided",
        },
        { status: 400 }
      );
    }

    const conn = await dbConnect();

    if (!conn) {
      return dbNotConfiguredResponse();
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: "global" },
      {
        $set: updateData,
        $setOnInsert: { key: "global" },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .select(
        "whatsappNumber facebookPageUrl supportEmail isActive"
      )
      .lean();

    return NextResponse.json({
      success: true,
      message: "Support settings saved successfully",
      settings: {
        whatsappNumber: settings.whatsappNumber || "",
        facebookPageUrl: settings.facebookPageUrl || "",
        supportEmail: settings.supportEmail || "",
        isActive: settings.isActive,
      },
    });
  } catch (error) {
    console.error("Support settings POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save support settings",
      },
      { status: 500 }
    );
  }
}
