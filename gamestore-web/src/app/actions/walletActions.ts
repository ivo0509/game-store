"use server";

import { revalidatePath } from "next/cache";

import { getSessionPayload } from "@/lib/auth";
import { addFunds, checkout, refundGame } from "@/services/walletService";

// ─── Add funds ────────────────────────────────────────────────────────────────

export type WalletFormState = {
  error?: string;
  success?: boolean;
};

export async function addFundsAction(
  _prev: WalletFormState,
  formData: FormData
): Promise<WalletFormState> {
  const session = await getSessionPayload();
  if (!session?.userId) {
    return { error: "You must be logged in." };
  }

  if (session.role === "publisher" || session.role === "admin") {
    return { error: "Publishers and admins cannot add funds." };
  }

  const raw = String(formData.get("amount") ?? "").trim();
  const amount = parseFloat(raw);

  if (!raw || isNaN(amount) || amount <= 0) {
    return { error: "Amount must be greater than 0." };
  }

  if (amount > 10000) {
    return { error: "Cannot add more than $10,000 at once." };
  }

  try {
    await addFunds(session.userId, amount);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to add funds." };
  }

  revalidatePath("/wallet");
  return { success: true };
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export type CheckoutState = {
  error?: string;
  purchasedItems?: Array<{ title: string; publisherName: string }>;
};

export async function checkoutAction(
  _prev: CheckoutState,
  _formData: FormData
): Promise<CheckoutState> {
  const session = await getSessionPayload();
  if (!session?.userId) {
    return { error: "You must be logged in." };
  }

  let result;
  try {
    result = await checkout(session.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Checkout failed." };
  }

  revalidatePath("/library");
  revalidatePath("/checkout");
  revalidatePath("/wallet");
  return { purchasedItems: result.purchasedItems };
}

// ─── Refund ───────────────────────────────────────────────────────────────────

export type RefundState = {
  error?: string;
  success?: boolean;
  publisherName?: string;
};

export async function refundGameAction(
  _prev: RefundState,
  formData: FormData
): Promise<RefundState> {
  const session = await getSessionPayload();
  if (!session?.userId) {
    return { error: "You must be logged in." };
  }

  const gameId = Number(formData.get("gameId"));
  if (!gameId) {
    return { error: "Invalid game." };
  }

  let result;
  try {
    result = await refundGame(session.userId, gameId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Refund failed." };
  }

  revalidatePath("/library");
  revalidatePath("/wallet");
  revalidatePath(`/games/${gameId}`);
  return { success: true, publisherName: result.publisherName };
}
