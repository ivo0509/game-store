import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { cartItems, games } from "@/db/schema";
import {
  verifyBearerToken,
  unauthorizedResponse,
  badRequestResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";
import { getCartSummary } from "@/services/walletService";

export async function GET(request: NextRequest) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  try {
    const items = await getCartSummary(session.userId);
    return Response.json({ data: items });
  } catch (err) {
    console.error("[GET /api/cart]", err);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  if (session.role === "publisher" || session.role === "admin") {
    return forbiddenResponse("Publishers and admins cannot use the cart.");
  }

  let body: { gameId?: number };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body.");
  }

  const gameId = Number(body.gameId);
  if (!Number.isInteger(gameId)) {
    return badRequestResponse("gameId must be an integer.");
  }

  try {
    const game = await db.query.games.findFirst({
      where: and(eq(games.id, gameId), eq(games.status, "published")),
      columns: { id: true },
    });
    if (!game) return badRequestResponse("Game not found or not available.");

    const existing = await db
      .select({ id: cartItems.id })
      .from(cartItems)
      .where(
        and(eq(cartItems.userId, session.userId), eq(cartItems.gameId, gameId))
      )
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ message: "Game already in cart." });
    }

    await db.insert(cartItems).values({ userId: session.userId, gameId });
    return Response.json({ message: "Added to cart." }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/cart]", err);
    return serverErrorResponse();
  }
}
