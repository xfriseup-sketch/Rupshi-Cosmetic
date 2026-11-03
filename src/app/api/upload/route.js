import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cloudinary from "cloudinary";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCloudinary() {
  const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const api_key = (process.env.CLOUDINARY_API_KEY || "").trim();
  const api_secret = (process.env.CLOUDINARY_API_SECRET || "").trim();

  if (!cloud_name || !api_key || !api_secret) return null;

  cloudinary.config({ cloud_name, api_key, api_secret });
  return cloudinary;
}

const MAX_SIZE_MB = 4;

export async function POST(request) {
  try {
    const token = cookies().get(ADMIN_COOKIE)?.value;
    if (!(await verifySessionToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const cld = getCloudinary();
    if (!cld) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message:
            "Cloudinary কনফিগার করা হয়নি। দয়া করে CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY এবং CLOUDINARY_API_SECRET সেট করুন।",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "কোনো ছবি পাঠানো হয়নি (file ফিল্ড আবশ্যক)" },
        { status: 400 }
      );
    }

    if (!/^image\//.test(file.type || "")) {
      return NextResponse.json(
        { success: false, message: "শুধুমাত্র ছবি ফাইল আপলোড করা যাবে (JPG/PNG/WebP)" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: `ছবির সাইজ ${MAX_SIZE_MB}MB এর কম হতে হবে` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const dataUri = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;
    const result = await cld.uploader.upload(dataUri, {
      folder: "rupshi-cosmetic/products",
      resource_type: "image",
      transformation: [{ width: 1200, crop: "limit" }],
    });

    return NextResponse.json({
      success: true,
      message: "ছবি আপলোড হয়েছে",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "আপলোড ব্যর্থ হয়েছে — আবার চেষ্টা করুন" },
      { status: 500 }
    );
  }
}