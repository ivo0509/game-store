"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { getSessionPayload } from "@/lib/auth";

export async function toggleWishlistAction(gameId: number) {
  try {
    const session = await getSessionPayload();
    if (!session?.userId) {
      throw new Error("You must be logged in to manage your wishlist");
    }

    const existing = await db
      .select({ id: wishlistItems.id })
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, session.userId),
          eq(wishlistItems.gameId, gameId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(wishlistItems)
        .where(
          and(
            eq(wishlistItems.userId, session.userId),
            eq(wishlistItems.gameId, gameId)
          )
        );
      return { success: true, wishlisted: false };
    }

    await db.insert(wishlistItems).values({
      userId: session.userId,
      gameId,
    });

    return { success: true, wishlisted: true };
  } catch (error) {
    return {
      success: false,
      wishlisted: false,
      error: error instanceof Error ? error.message : "Failed to update wishlist",
    };
  }
}

export async function isGameWishlisted(
  userId: number,
  gameId: number
): Promise<boolean> {
  const rows = await db
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(
      and(eq(wishlistItems.userId, userId), eq(wishlistItems.gameId, gameId))
    )
    .limit(1);

  return rows.length > 0;
}
