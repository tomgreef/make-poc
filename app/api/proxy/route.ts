import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Replace these with your real values from environment variables:
 */
const SECRET_KEY = process.env.MAKE_BRIDGE_API_SECRET;
const KEY_ID = process.env.MAKE_BRIDGE_API_KEY_ID;
const PORTAL_URL = process.env.MAKE_BRIDGE_PORTAL_URL || "https://eu2.make.com";

/**
 * Helper function to validate authentication
 */
async function validateAuth(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    throw new Error("Unauthorized - No user session found");
  }

  return userId;
}

/**
 * Generate JWT token for Make.com authentication
 */
function generateToken(userId: string) {
  if (!SECRET_KEY || !KEY_ID) {
    throw new Error(
      "Missing required environment variables for JWT generation"
    );
  }

  return jwt.sign(
    {
      sub: userId,
      jti: crypto.randomUUID(),
    },
    SECRET_KEY,
    {
      expiresIn: "2m",
      keyid: KEY_ID,
    }
  );
}

/**
 * Main handler for all HTTP methods
 */
async function handleProxy(request: NextRequest) {
  try {
    // Validate auth and get userId
    const userId = await validateAuth(request);

    // Generate fresh JWT
    const token = generateToken(userId);

    // Prepare the target URL
    const url = new URL(request.url);
    const targetPath = url.pathname.replace("/api/proxy", "");
    const targetUrl = `${PORTAL_URL}${targetPath}${url.search}`;

    // Prepare headers
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);

    // Copy relevant headers from original request
    request.headers.forEach((value, key) => {
      if (!["host", "authorization"].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Forward the request to Make.com
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.text(),
    });

    // Prepare response headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Export handlers for all HTTP methods
export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
