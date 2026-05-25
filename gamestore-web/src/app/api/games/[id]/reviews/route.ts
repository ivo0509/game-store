import { NextRequest } from "next/server";

import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  unauthorizedResponse,
  verifyBearerToken,
} from "@/lib/apiAuth";
import {
  createReview,
  getReviewsForGame,
} from "@/services/reviewsService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) return notFoundResponse("Invalid game id.");

  try {
    const rows = await getReviewsForGame(gameId);
    return Response.json({
      data: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        rating: r.rating,
        comment: r.comment,
        authorName: r.authorName,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/games/[id]/reviews]", err);
    return serverErrorResponse();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) return notFoundResponse("Invalid game id.");

  let body: { rating?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body.");
  }

  const rating = Number(body.rating);
  const comment = typeof body.comment === "string" ? body.comment : "";

  try {
    await createReview(session.userId, gameId, { rating, comment });
    return Response.json({ message: "Review posted." }, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      return badRequestResponse(err.message);
    }
    console.error("[POST /api/games/[id]/reviews]", err);
    return serverErrorResponse();
  }
}
