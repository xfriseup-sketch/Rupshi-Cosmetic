import { NextResponse } from "next/server";

/**
 * Shared helper for API routes that need a MongoDB connection.
 *
 * dbConnect() returns `null` (instead of throwing) when MONGODB_URI is not
 * configured — e.g. on a fresh Vercel deployment before the env var is set.
 * This helper turns that case into a clean 503 JSON response so the app
 * never crashes and the frontend can show a friendly message.
 */
export const DB_NOT_CONFIGURED_MESSAGE =
  "Database not configured yet. Please set MONGODB_URI in environment variables.";

export function dbNotConfiguredResponse() {
  return NextResponse.json(
    {
      success: false,
      dbConfigured: false,
      message: DB_NOT_CONFIGURED_MESSAGE,
    },
    { status: 503 }
  );
}
