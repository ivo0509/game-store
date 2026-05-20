import { eq } from "drizzle-orm";
import { db } from "@/db";
import { games } from "@/db/schema";

export type Game = {
  id: number;
  title: string;
  description: string;
  genre: string;
  platforms: string[];
  releaseDate: string | null;
  price: string;
  discountPercent: number;
  coverImageUrl: string | null;
  trailerUrl: string | null;
  ageRating: string | null;
};

export async function getPublishedGames(): Promise<Game[]> {
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
    .from(games)
    .where(eq(games.status, "published"))
    .orderBy(games.createdAt);

  return rows;
}

export async function getGameById(id: number): Promise<Game | null> {
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
    .from(games)
    .where(eq(games.id, id))
    .limit(1);

  return rows[0] ?? null;
}
