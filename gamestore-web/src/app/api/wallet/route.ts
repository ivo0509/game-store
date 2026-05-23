import { NextRequest } from "next/server";

import {
  verifyBearerToken,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";
import { getWalletBalance, addFunds } from "@/services/walletService";

export async function GET(request: NextRequest) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  try {
    const balance = await getWalletBalance(session.userId);
    return Response.json({ balance });
  } catch (err) {
    console.error("[GET /api/wallet]", err);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  let body: { amount?: number };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body.");
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return badRequestResponse("Amount must be a positive number.");
  }

  try {
    await addFunds(session.userId, amount);
    const balance = await getWalletBalance(session.userId);
    return Response.json({ balance, message: `Added $${amount.toFixed(2)} to wallet.` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add funds.";
    return Response.json({ error: message }, { status: 400 });
  }
}
