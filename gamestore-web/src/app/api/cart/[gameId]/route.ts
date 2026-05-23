import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { cartItems } from "@/db/schema";
import {
  verifyBearerToken,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  const { gameId: gameIdStr } = await params;
  const gameId = parseInt(gameIdStr, 10);
  if (isNaN(gameId)) return badRequestResponse("Invalid gameId.");

  try {
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.userId, session.userId), eq(cartItems.gameId, gameId))
      );
    return Response.json({ message: "Removed from cart." });
  } catch (err) {
    console.error("[DELETE /api/cart/[gameId]]", err);
    return serverErrorResponse();
  }
}
