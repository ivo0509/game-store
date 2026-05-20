"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { getSessionPayload } from "@/lib/auth";

export async function addToCartAction(gameId: number) {
  try {
    const session = await getSessionPayload();
    if (!session?.userId) {
      throw new Error("You must be logged in to add items to cart");
    }

    // Check if item already exists in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, session.userId),
          eq(cartItems.gameId, gameId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: true, message: "Item already in cart" };
    }

    // Add to cart
    await db.insert(cartItems).values({
      userId: session.userId,
      gameId,
    });

    return { success: true, message: "Added to cart" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to add to cart",
    };
  }
}

export async function removeFromCartAction(gameId: number) {
  try {
    const session = await getSessionPayload();
    if (!session?.userId) {
      throw new Error("You must be logged in");
    }

    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, session.userId),
          eq(cartItems.gameId, gameId)
        )
      );

    return { success: true, message: "Removed from library" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to remove from library",
    };
  }
}
