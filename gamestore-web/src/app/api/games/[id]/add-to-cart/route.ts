import { NextRequest } from "next/server";

import {
  verifyBearerToken,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";
import { purchaseSingleGame } from "@/services/walletService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  if (session.role === "publisher" || session.role === "admin") {
    return forbiddenResponse("Publishers and admins cannot purchase games.");
  }

  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) return badRequestResponse("Invalid game id.");

  try {
    const result = await purchaseSingleGame(session.userId, gameId);
    return Response.json(
      {
        message: `Successfully purchased "${result.title}".`,
        orderId: result.orderId,
        finalPrice: result.finalPrice,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Purchase failed.";
    // Business-logic errors (already owned, insufficient balance, not available)
    const clientErrors = [
      "already own",
      "not found or not available",
      "insufficient wallet",
    ];
    if (clientErrors.some((s) => message.toLowerCase().includes(s))) {
      return Response.json({ error: message }, { status: 400 });
    }
    console.error("[POST /api/games/[id]/add-to-cart]", err);
    return serverErrorResponse();
  }
}
