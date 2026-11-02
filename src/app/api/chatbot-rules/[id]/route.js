import mongoose from "mongoose";
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

function validateRule(body) {
  if (body.keywords !== undefined) {
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
  if (body.answer !== undefined) {
    if (typeof body.answer !== "string" || !body.answer.trim() || body.answer.length > 5000) {
      return "answer must be non-empty and at most 5000 characters";
    }
  }
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return "isActive must be a boolean";
  }
  if (body.keywords === undefined && body.answer === undefined && body.isActive === undefined) {
    return "No valid fields provided for update";
  }
  return null;
}

export async function PUT(request, context) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid chatbot rule ID" },
        { status: 400 }
      );
    }

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

    const rule = await ChatbotRule.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!rule) {
      return NextResponse.json(
        { success: false, message: "Chatbot rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chatbot rule updated successfully",
      rule,
    });
  } catch (error) {
    console.error("Chatbot rule PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update chatbot rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid chatbot rule ID" },
        { status: 400 }
      );
    }

    const rule = await ChatbotRule.findByIdAndDelete(id);
    if (!rule) {
      return NextResponse.json(
        { success: false, message: "Chatbot rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chatbot rule deleted successfully",
    });
  } catch (error) {
    console.error("Chatbot rule DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete chatbot rule" },
      { status: 500 }
    );
  }
}
