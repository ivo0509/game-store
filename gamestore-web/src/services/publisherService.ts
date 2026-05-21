import { and, eq, sql, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MIN_RELEASE_YEAR = 1970;
const MAX_RELEASE_YEAR = 2100;

const TITLE_MIN = 2;
const TITLE_MAX = 200;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 5000;
const GENRE_MIN = 2;
const GENRE_MAX = 60;
const AGE_RATING_MAX = 10;
const MAX_PRICE = 9999.99;
const ALLOWED_AGE_RATINGS = [
  "3+",
  "7+",
  "12+",
  "16+",
  "18+",
  "E",
  "E10+",
  "T",
  "M",
  "AO",
];

function validateHttpUrl(value: string, label: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error();
    }
    return url.toString();
  } catch {
    throw new Error(`${label} must be a valid http(s) URL.`);
  }
}

function validateReleaseDate(value: string | null): string | null {
  if (value === null || value === "") return null;

  if (!ISO_DATE_REGEX.test(value)) {
    throw new Error("Release date must be in YYYY-MM-DD format.");
  }

  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const parsed = new Date(Date.UTC(year, month - 1, day));
  // Verify the parsed date matches the input (catches 2024-02-30, etc.)
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("Release date is not a valid calendar date.");
  }

  if (year < MIN_RELEASE_YEAR || year > MAX_RELEASE_YEAR) {
    throw new Error(
      `Release date year must be between ${MIN_RELEASE_YEAR} and ${MAX_RELEASE_YEAR}.`
    );
  }

  return value;
}

function validateInput(input: PublisherGameInput) {
  // Title
  const title = input.title.trim();
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    throw new Error(
      `Title must be between ${TITLE_MIN} and ${TITLE_MAX} characters.`
    );
  }
  input.title = title;

  // Description
  const description = input.description.trim();
  if (
    description.length < DESCRIPTION_MIN ||
    description.length > DESCRIPTION_MAX
  ) {
    throw new Error(
      `Description must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters.`
    );
  }
  input.description = description;

  // Genre
  const genre = input.genre.trim();
  if (genre.length < GENRE_MIN || genre.length > GENRE_MAX) {
    throw new Error(
      `Genre must be between ${GENRE_MIN} and ${GENRE_MAX} characters.`
    );
  }
  input.genre = genre;

  // Platforms
  const platforms = input.platforms
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (platforms.length === 0) {
    throw new Error("At least one platform is required.");
  }
  if (platforms.some((p) => p.length > 40)) {
    throw new Error("Each platform name must be 40 characters or fewer.");
  }
  input.platforms = platforms;

  // Price
  const priceNumber = Number(input.price);
  if (!Number.isFinite(priceNumber)) {
    throw new Error("Price must be a valid number.");
  }
  if (priceNumber < 0) {
    throw new Error("Price must be a non-negative number.");
  }
  if (priceNumber > MAX_PRICE) {
    throw new Error(`Price must not exceed ${MAX_PRICE}.`);
  }
  if (!/^\d+(\.\d{1,2})?$/.test(input.price)) {
    throw new Error("Price must have at most 2 decimal places.");
  }

  // Discount
  if (
    !Number.isInteger(input.discountPercent) ||
    input.discountPercent < 0 ||
    input.discountPercent > 100
  ) {
    throw new Error("Discount percent must be an integer between 0 and 100.");
  }

  // Age rating (optional)
  if (input.ageRating) {
    const ageRating = input.ageRating.trim();
    if (ageRating.length > AGE_RATING_MAX) {
      throw new Error(
        `Age rating must be ${AGE_RATING_MAX} characters or fewer.`
      );
    }
    if (!ALLOWED_AGE_RATINGS.includes(ageRating)) {
      throw new Error(
        `Age rating must be one of: ${ALLOWED_AGE_RATINGS.join(", ")}.`
      );
    }
    input.ageRating = ageRating;
  } else {
    input.ageRating = null;
  }

  // Release date
  input.releaseDate = validateReleaseDate(input.releaseDate);

  // Cover image URL (optional)
  if (input.coverImageUrl) {
    input.coverImageUrl = validateHttpUrl(
      input.coverImageUrl.trim(),
      "Cover image URL"
    );
  } else {
    input.coverImageUrl = null;
  }

  // Trailer URL (optional)
  if (input.trailerUrl) {
    input.trailerUrl = validateHttpUrl(
      input.trailerUrl.trim(),
      "Trailer URL"
    );
  } else {
    input.trailerUrl = null;
  }

  // Status
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

// ─── Sold Games ───────────────────────────────────────────────────────────────

export type SoldGameRow = {
  orderItemId: number;
  gameId: number;
  gameTitle: string;
  buyerName: string;
  finalPrice: string;
  purchasedAt: Date;
};

/** Sold games for a specific publisher */
export async function getPublisherSoldGames(publisherId: number): Promise<SoldGameRow[]> {
  const rows = await db
    .select({
      orderItemId: orderItems.id,
      gameId: games.id,
      gameTitle: games.title,
      buyerName: users.name,
      finalPrice: orderItems.finalPrice,
      purchasedAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(games, eq(games.id, orderItems.gameId))
    .innerJoin(users, eq(users.id, orders.userId))
    .where(and(eq(games.publisherId, publisherId), eq(orders.status, "paid")))
    .orderBy(desc(orders.createdAt));

  return rows;
}

/** All sold games across every publisher (admin only) */
export async function getAllSoldGames(): Promise<(SoldGameRow & { publisherName: string })[]> {
  const publisherUsers = alias(users, "publisher_users");

  const rows = await db
    .select({
      orderItemId: orderItems.id,
      gameId: games.id,
      gameTitle: games.title,
      buyerName: users.name,
      publisherName: publisherUsers.name,
      finalPrice: orderItems.finalPrice,
      purchasedAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(games, eq(games.id, orderItems.gameId))
    .innerJoin(users, eq(users.id, orders.userId))
    .innerJoin(publisherUsers, eq(publisherUsers.id, games.publisherId))
    .where(eq(orders.status, "paid"))
    .orderBy(desc(orders.createdAt));

  return rows;
}

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
