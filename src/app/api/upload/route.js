import { NextResponse } from "next/server";
import cloudinary from "cloudinary/lib/cloudinary";

// Configure Cloudinary from environment variables (server-side only).
// Reading env at call time (not module load) keeps `next build` working on
// Vercel even before the credentials are added in Project Settings.
function getCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    return null;
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
  return cloudinary;
}

const MAX_SIZE_MB = 5;

/**
 * POST /api/upload
 * Accepts multipart/form-data with a single `file` field and uploads it to
 * Cloudinary under the "rupshi-cosmetic/products" folder.
 * Returns { success, url, public_id } with the secure_url of the image.
 */
export async function POST(request) {
  try {
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

    // Basic type + size validation
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

    // Convert the uploaded file to a base64 data URI for Cloudinary's
    // upload_stream — no need for formidable since Web Request.formData()
    // already parses multipart/form-data natively on the server.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    

    const result = await new Promise((resolve, reject) => {
      cld.uploader
        .upload_stream(
          {
            folder: "rupshi-cosmetic/products",
            resource_type: "image",
            transformation: [{ width: 1200, crop: "limit" }],
          },
          (error, res) => (error ? reject(error) : resolve(res))
        )
        .end(buffer);
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
      { success: false, message: "আপলোড ব্যর্থ হয়েছে — আবার চেষ্টা করুন", error: error.message },
      { status: 500 }
    );
  }
}
