import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET_KEY = process.env.MAKE_BRIDGE_API_SECRET;
const KEY_ID = process.env.MAKE_BRIDGE_API_KEY_ID;
const PORTAL_URL = "https://eu2.make.com";

export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function POST(request: NextRequest) {
  return handleProxy(request);
}

export async function PUT(request: NextRequest) {
  return handleProxy(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request);
}

async function handleProxy(request: NextRequest) {
  // Check for userId in session/headers (adapt based on your auth strategy)
  const userId =
    request.headers.get("x-user-id") || request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      sub: userId,
      jti: crypto.randomUUID(),
    },
    SECRET_KEY!,
    {
      expiresIn: "2m",
      keyid: KEY_ID,
    }
  );

  // Extract the target path from the request
  const url = new URL(request.url);
  const targetPath = url.pathname.replace("/api/proxy", "");
  const targetUrl = `${PORTAL_URL}${targetPath}${url.search}`;

  // Forward the request
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  // Copy relevant headers from original request
  request.headers.forEach((value, key) => {
    if (!["host", "authorization"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" ? await request.text() : undefined,
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 500 }
    );
  }
}
