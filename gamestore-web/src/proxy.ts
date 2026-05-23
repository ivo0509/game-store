import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/auth/login",
  "/auth/register",
]);

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return new TextEncoder().encode(secret);
}

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight (OPTIONS) for /api/* so clients on different
  // origins (e.g. the Expo web/mobile app) can call the API.
  if (request.method === "OPTIONS" && pathname.startsWith("/api")) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    try {
      await jwtVerify(token, getJwtSecret());
      return NextResponse.next();
    } catch {
      // Invalid or expired tokens fall through to the login redirect.
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
