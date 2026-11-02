import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import ChatbotRule from "@/models/ChatbotRule";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function isAdminAuthenticated(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return token ? verifySessionToken(token) : false;
}

function validateRule(body, { partial = false } = {}) {
  if (!partial || body.keywords !== undefined) {
    if (
      !Array.isArray(body.keywords) ||
      body.keywords.length < 1 ||
      body.keywords.length > 50 ||
      body.keywords.some(
        (word) => typeof word !== "string" || !word.trim() || word.trim().length > 100
      )
    ) {
      return "keywords must contain 1 to 50 non-empty strings (max 100 characters each)";
    }
  }
  if (!partial || body.answer !== undefined) {
    if (typeof body.answer !== "string" || !body.answer.trim() || body.answer.length > 5000) {
      return "answer is required and must be at most 5000 characters";
    }
  }
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return "isActive must be a boolean";
  }
  return null;
}

export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "Database not configured", rules: [] },
        { status: 503 }
      );
    }

    const rules = await ChatbotRule.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("keywords answer isActive createdAt updatedAt")
      .lean();

    return NextResponse.json(
      { success: true, rules },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("Chatbot rules GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chatbot rules" },
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

    const validationError = validateRule(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const rule = await ChatbotRule.create({
      keywords: body.keywords,
      answer: body.answer,
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    });

    return NextResponse.json(
      { success: true, message: "Chatbot rule created successfully", rule },
      { status: 201 }
    );
  } catch (error) {
    console.error("Chatbot rules POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create chatbot rule" },
      { status: 500 }
    );
  }
}
