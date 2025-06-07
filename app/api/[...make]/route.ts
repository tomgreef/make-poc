import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.MAKE_BRIDGE_API_SECRET;
const KEY_ID = process.env.MAKE_BRIDGE_API_KEY_ID;
const PORTAL_URL = process.env.MAKE_BRIDGE_PORTAL_URL || "https://eu2.make.com";

async function validateAuth(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    throw new Error("Unauthorized - No user session found");
  }

  return userId;
}

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

async function handler(request: NextRequest) {
  try {
    // Validate auth and get userId
    const userId = await validateAuth(request);

    // Generate fresh JWT
    const token = generateToken(userId);

    const url = new URL(request.url);
    const targetPath = url.pathname.replace("/api/make", "/portal");
    const targetUrl = `${PORTAL_URL}${targetPath}${url.search}`;

    // Add authorization header to the original request
    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);

    // Forward the request to Make.com
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
    });

    return NextResponse.json(await response.json());
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

// Export the handler for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
