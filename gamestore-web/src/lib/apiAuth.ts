import { verifySessionToken } from "@/lib/auth";
import type { AuthTokenPayload } from "@/lib/auth";

/**
 * Extracts and verifies a Bearer JWT token from the Authorization header.
 * Returns the decoded payload or null if missing / invalid.
 */
export async function verifyBearerToken(
  request: Request
): Promise<AuthTokenPayload | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return verifySessionToken(token);
}

export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function badRequestResponse(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function notFoundResponse(message = "Not found") {
  return Response.json({ error: message }, { status: 404 });
}

export function forbiddenResponse(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}

export function serverErrorResponse(message = "Internal server error") {
  return Response.json({ error: message }, { status: 500 });
}
