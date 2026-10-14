import mongoose from "mongoose";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route visits.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Warn once at module load if the env var is missing — but do NOT throw,
// so the app can still build/render static pages and API routes can
// respond gracefully (503) until MONGODB_URI is configured (e.g. on Vercel).
let warnedMissingUri = false;

/**
 * Connects to MongoDB using mongoose and returns the mongoose instance.
 * Returns `null` when MONGODB_URI is not defined, instead of crashing the
 * serverless function. Callers must handle the null case (see
 * src/lib/dbStatus.js for the shared 503 helper).
 *
 * In development, the connection is cached on the global object so that
 * Next.js hot-reloading does not open multiple connections.
 */
async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  // No URI configured → skip connecting entirely and signal "not ready".
  if (!MONGODB_URI) {
    if (!warnedMissingUri) {
      console.warn(
        "[rupshi] MONGODB_URI is not set — skipping MongoDB connection. " +
          "Set it in .env.local (dev) or Project Settings → Environment Variables (Vercel)."
      );
      warnedMissingUri = true;
    }
    // Reset any stale cached state so adding the env var later works cleanly.
    cached.conn = null;
    cached.promise = null;
    return null;
  }

  // Return the cached connection if it already exists
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise is in-flight, wait for it instead of
  // starting a second connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
