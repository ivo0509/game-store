import { NextRequest } from "next/server";

import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  unauthorizedResponse,
  verifyBearerToken,
} from "@/lib/apiAuth";
import { deleteOwnReview, updateOwnReview } from "@/services/reviewsService";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const reviewId = parseInt(id, 10);
  if (isNaN(reviewId)) return notFoundResponse("Invalid review id.");

  let body: { rating?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body.");
  }

  const rating = Number(body.rating);
  const comment = typeof body.comment === "string" ? body.comment : "";

  try {
    await updateOwnReview(session.userId, reviewId, { rating, comment });
    return Response.json({ message: "Review updated." });
  } catch (err) {
    if (err instanceof Error) {
      return badRequestResponse(err.message);
    }
    console.error("[PUT /api/reviews/[id]]", err);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const reviewId = parseInt(id, 10);
  if (isNaN(reviewId)) return notFoundResponse("Invalid review id.");

  try {
    await deleteOwnReview(session.userId, reviewId);
    return Response.json({ message: "Review deleted." });
  } catch (err) {
    if (err instanceof Error) {
      return badRequestResponse(err.message);
    }
    console.error("[DELETE /api/reviews/[id]]", err);
    return serverErrorResponse();
  }
}
