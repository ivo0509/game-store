import { NextRequest } from "next/server";

import {
  verifyBearerToken,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";
import { refundGame } from "@/services/walletService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  if (session.role === "publisher" || session.role === "admin") {
    return forbiddenResponse("Publishers and admins cannot request refunds.");
  }

  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) return badRequestResponse("Invalid game id.");

  try {
    const result = await refundGame(session.userId, gameId);
    return Response.json({
      message: `Refund processed successfully. Funds returned to your wallet.`,
      publisherName: result.publisherName,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refund failed.";
    if (message.toLowerCase().includes("no purchase found")) {
      return Response.json({ error: message }, { status: 400 });
    }
    console.error("[POST /api/games/[id]/refund]", err);
    return serverErrorResponse();
  }
}
