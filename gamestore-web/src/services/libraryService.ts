import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { games, cartItems } from "@/db/schema";
import type { Game } from "./gamesService";

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
    .from(cartItems)
    .innerJoin(games, eq(cartItems.gameId, games.id))
    .where(eq(cartItems.userId, userId))
    .orderBy(cartItems.createdAt);

  return rows;
}

export async function isGameInLibrary(
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
