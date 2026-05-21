import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, games, orderItems, orders } from "@/db/schema";
import type { Game } from "./gamesService";

// ─── Library (purchased games via paid orders) ────────────────────────────────

export async function getUserLibrary(userId: number): Promise<Game[]> {
  const rows = await db
    .select({
      id: games.id,
      title: games.title,
      description: games.description,
      genre: games.genre,
      platforms: games.platforms,
      releaseDate: games.releaseDate,
      price: games.price,
      discountPercent: games.discountPercent,
      coverImageUrl: games.coverImageUrl,
      trailerUrl: games.trailerUrl,
      ageRating: games.ageRating,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(games, eq(orderItems.gameId, games.id))
    .where(and(eq(orders.userId, userId), eq(orders.status, "paid")));

  return rows;
}

export async function isGameInLibrary(
  userId: number,
  gameId: number
): Promise<boolean> {
  const rows = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orderItems.gameId, gameId),
        eq(orders.status, "paid")
      )
    )
    .limit(1);

  return rows.length > 0;
}

// ─── Cart (pending, pre-purchase) ─────────────────────────────────────────────

export async function isGameInCart(
  userId: number,
  gameId: number
): Promise<boolean> {
  const rows = await db
    .select({ id: cartItems.id })
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.gameId, gameId)))
    .limit(1);

  return rows.length > 0;
}
