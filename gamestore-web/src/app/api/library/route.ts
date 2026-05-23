import { NextRequest } from "next/server";

import {
  verifyBearerToken,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";
import { getUserLibrary } from "@/services/libraryService";

export async function GET(request: NextRequest) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  try {
    const games = await getUserLibrary(session.userId);
    return Response.json({ data: games });
  } catch (err) {
    console.error("[GET /api/library]", err);
    return serverErrorResponse();
  }
}
