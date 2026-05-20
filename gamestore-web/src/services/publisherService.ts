import { and, eq, sql, desc } from "drizzle-orm";

import { db } from "@/db";
import {
  games,
  orderItems,
  orders,
  reviews,
  users,
} from "@/db/schema";

export type GameStatus = "draft" | "published" | "blocked";

export type PublisherGameInput = {
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
  status: GameStatus;
};

export type PublisherGame = {
  id: number;
  publisherId: number;
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
  status: GameStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PublisherGameSummary = PublisherGame & {
  purchases: number;
  revenue: string;
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateInput(input: PublisherGameInput) {
  if (!input.title.trim()) throw new Error("Title is required.");
  if (!input.description.trim()) throw new Error("Description is required.");
  if (!input.genre.trim()) throw new Error("Genre is required.");

  const priceNumber = Number(input.price);
  if (!Number.isFinite(priceNumber) || priceNumber < 0) {
    throw new Error("Price must be a non-negative number.");
  }

  if (
    !Number.isInteger(input.discountPercent) ||
    input.discountPercent < 0 ||
    input.discountPercent > 100
  ) {
    throw new Error("Discount percent must be an integer between 0 and 100.");
  }

  if (input.trailerUrl) {
    try {
      const url = new URL(input.trailerUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error();
      }
    } catch {
      throw new Error("Trailer URL must be a valid http(s) URL.");
    }
  }

  if (input.status !== "draft" && input.status !== "published") {
    throw new Error("Status must be draft or published.");
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createPublisherGame(
  publisherId: number,
  input: PublisherGameInput
): Promise<PublisherGame> {
  validateInput(input);

  const [created] = await db
    .insert(games)
    .values({
      publisherId,
      title: input.title.trim(),
      description: input.description.trim(),
      genre: input.genre.trim(),
      platforms: input.platforms,
      releaseDate: input.releaseDate,
      price: input.price,
      discountPercent: input.discountPercent,
      coverImageUrl: input.coverImageUrl,
      trailerUrl: input.trailerUrl,
      ageRating: input.ageRating,
      status: input.status,
    })
    .returning();

  return created as PublisherGame;
}

export async function updatePublisherGame(
  publisherId: number,
  gameId: number,
  input: PublisherGameInput
): Promise<PublisherGame> {
  validateInput(input);

  const existing = await getPublisherGameById(publisherId, gameId);
  if (!existing) {
    throw new Error("Game not found.");
  }
  if (existing.status === "blocked") {
    throw new Error("Blocked games cannot be edited.");
  }

  const [updated] = await db
    .update(games)
    .set({
      title: input.title.trim(),
      description: input.description.trim(),
      genre: input.genre.trim(),
      platforms: input.platforms,
      releaseDate: input.releaseDate,
      price: input.price,
      discountPercent: input.discountPercent,
      coverImageUrl: input.coverImageUrl,
      trailerUrl: input.trailerUrl,
      ageRating: input.ageRating,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(and(eq(games.id, gameId), eq(games.publisherId, publisherId)))
    .returning();

  return updated as PublisherGame;
}

export async function updatePublisherGameStatus(
  publisherId: number,
  gameId: number,
  status: GameStatus
) {
  if (status !== "draft" && status !== "published") {
    throw new Error("Status must be draft or published.");
  }

  const existing = await getPublisherGameById(publisherId, gameId);
  if (!existing) {
    throw new Error("Game not found.");
  }
  if (existing.status === "blocked") {
    throw new Error("Blocked games cannot change status.");
  }

  await db
    .update(games)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(games.id, gameId), eq(games.publisherId, publisherId)));
}

export async function deletePublisherGame(
  publisherId: number,
  gameId: number
) {
  const existing = await getPublisherGameById(publisherId, gameId);
  if (!existing) {
    throw new Error("Game not found.");
  }

  const purchaseCount = await countGamePurchases(gameId);
  if (purchaseCount > 0) {
    throw new Error(
      "Game has already been purchased and cannot be deleted."
    );
  }

  await db
    .delete(games)
    .where(and(eq(games.id, gameId), eq(games.publisherId, publisherId)));
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getPublisherGameById(
  publisherId: number,
  gameId: number
): Promise<PublisherGame | null> {
  const rows = await db
    .select()
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.publisherId, publisherId)))
    .limit(1);

  return (rows[0] as PublisherGame | undefined) ?? null;
}

export async function listPublisherGames(
  publisherId: number
): Promise<PublisherGameSummary[]> {
  const rows = await db
    .select({
      id: games.id,
      publisherId: games.publisherId,
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
      status: games.status,
      createdAt: games.createdAt,
      updatedAt: games.updatedAt,
      purchases: sql<number>`COALESCE(COUNT(${orderItems.id})::int, 0)`,
      revenue: sql<string>`COALESCE(SUM(${orderItems.finalPrice}), 0)::text`,
    })
    .from(games)
    .leftJoin(
      orderItems,
      and(
        eq(orderItems.gameId, games.id),
        sql`EXISTS (SELECT 1 FROM ${orders} WHERE ${orders.id} = ${orderItems.orderId} AND ${orders.status} = 'paid')`
      )
    )
    .where(eq(games.publisherId, publisherId))
    .groupBy(games.id)
    .orderBy(desc(games.createdAt));

  return rows as PublisherGameSummary[];
}

async function countGamePurchases(gameId: number): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orderItems.gameId, gameId), eq(orders.status, "paid")));

  return rows[0]?.count ?? 0;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export type GameSale = {
  orderId: number;
  buyerName: string;
  buyerEmail: string;
  finalPrice: string;
  priceAtPurchase: string;
  discountAtPurchase: number;
  purchasedAt: Date;
};

export async function getPublisherGameSales(
  publisherId: number,
  gameId: number
): Promise<GameSale[]> {
  const owned = await getPublisherGameById(publisherId, gameId);
  if (!owned) {
    throw new Error("Game not found.");
  }

  const rows = await db
    .select({
      orderId: orders.id,
      buyerName: users.name,
      buyerEmail: users.email,
      finalPrice: orderItems.finalPrice,
      priceAtPurchase: orderItems.priceAtPurchase,
      discountAtPurchase: orderItems.discountAtPurchase,
      purchasedAt: orderItems.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(users, eq(users.id, orders.userId))
    .where(
      and(
        eq(orderItems.gameId, gameId),
        eq(orders.status, "paid")
      )
    )
    .orderBy(desc(orderItems.createdAt));

  return rows;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export type GameReview = {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: Date;
};

export async function getPublisherGameReviews(
  publisherId: number,
  gameId: number
): Promise<GameReview[]> {
  const owned = await getPublisherGameById(publisherId, gameId);
  if (!owned) {
    throw new Error("Game not found.");
  }

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      authorName: users.name,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(eq(reviews.gameId, gameId))
    .orderBy(desc(reviews.createdAt));

  return rows;
}

// ─── Revenue Summary ──────────────────────────────────────────────────────────

export type PublisherSummary = {
  totalGames: number;
  publishedGames: number;
  totalPurchases: number;
  totalRevenue: string;
};

export async function getPublisherSummary(
  publisherId: number
): Promise<PublisherSummary> {
  const gameRows = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      published: sql<number>`COUNT(*) FILTER (WHERE ${games.status} = 'published')::int`,
    })
    .from(games)
    .where(eq(games.publisherId, publisherId));

  const salesRows = await db
    .select({
      purchases: sql<number>`COUNT(*)::int`,
      revenue: sql<string>`COALESCE(SUM(${orderItems.finalPrice}), 0)::text`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(games, eq(games.id, orderItems.gameId))
    .where(
      and(eq(games.publisherId, publisherId), eq(orders.status, "paid"))
    );

  return {
    totalGames: gameRows[0]?.total ?? 0,
    publishedGames: gameRows[0]?.published ?? 0,
    totalPurchases: salesRows[0]?.purchases ?? 0,
    totalRevenue: salesRows[0]?.revenue ?? "0",
  };
}
