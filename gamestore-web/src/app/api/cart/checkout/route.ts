import { NextRequest } from "next/server";

import {
  verifyBearerToken,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";
import { checkout } from "@/services/walletService";

export async function POST(request: NextRequest) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  if (session.role === "publisher" || session.role === "admin") {
    return forbiddenResponse("Publishers and admins cannot purchase games.");
  }

  try {
    const result = await checkout(session.userId);
    return Response.json(
      { message: "Checkout successful.", ...result },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    const clientErrors = [
      "no published",
      "already own",
      "insufficient",
      "cart has no",
    ];
    if (clientErrors.some((s) => message.toLowerCase().includes(s))) {
      return Response.json({ error: message }, { status: 400 });
    }
    console.error("[POST /api/cart/checkout]", err);
    return serverErrorResponse();
  }
}
