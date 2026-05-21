import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { cartItems, games, reviews, users } from "@/db/schema";

export type GameReviewView = {
  id: number;
  userId: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReviewEligibility = {
  canReview: boolean;
  reason: "not_logged_in" | "own_game" | "not_purchased" | null;
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateReviewInput(input: { rating: number; comment: string }) {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  if (!input.comment || !input.comment.trim()) {
    throw new Error("Comment must not be empty.");
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getReviewsForGame(
  gameId: number
): Promise<GameReviewView[]> {
  const rows = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      authorName: users.name,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(eq(reviews.gameId, gameId))
    .orderBy(desc(reviews.createdAt));

  return rows;
}

export async function getUserReviewForGame(
  userId: number,
  gameId: number
): Promise<GameReviewView | null> {
  const rows = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      authorName: users.name,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(and(eq(reviews.userId, userId), eq(reviews.gameId, gameId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function hasUserPurchasedGame(
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

export async function getReviewEligibility(
  userId: number | null,
  gameId: number
): Promise<ReviewEligibility> {
  if (!userId) return { canReview: false, reason: "not_logged_in" };

  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
    columns: { publisherId: true },
  });

  if (game?.publisherId === userId) {
    return { canReview: false, reason: "own_game" };
  }

  const purchased = await hasUserPurchasedGame(userId, gameId);
  if (!purchased) {
    return { canReview: false, reason: "not_purchased" };
  }

  return { canReview: true, reason: null };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createReview(
  userId: number,
  gameId: number,
  input: { rating: number; comment: string }
) {
  validateReviewInput(input);

  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
    columns: { id: true, publisherId: true },
  });
  if (!game) throw new Error("Game not found.");

  if (game.publisherId === userId) {
    throw new Error("Publishers cannot review their own games.");
  }

  const purchased = await hasUserPurchasedGame(userId, gameId);
  if (!purchased) {
    throw new Error("You can only review games you have purchased.");
  }

  const existing = await getUserReviewForGame(userId, gameId);
  if (existing) {
    throw new Error("You have already reviewed this game.");
  }

  await db.insert(reviews).values({
    userId,
    gameId,
    rating: input.rating,
    comment: input.comment.trim(),
  });
}

export async function updateOwnReview(
  userId: number,
  reviewId: number,
  input: { rating: number; comment: string }
) {
  validateReviewInput(input);

  const existing = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    columns: { id: true, userId: true },
  });

  if (!existing) throw new Error("Review not found.");
  if (existing.userId !== userId) {
    throw new Error("You can only edit your own review.");
  }

  await db
    .update(reviews)
    .set({
      rating: input.rating,
      comment: input.comment.trim(),
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, reviewId));
}

export async function deleteOwnReview(userId: number, reviewId: number) {
  const existing = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    columns: { id: true, userId: true },
  });

  if (!existing) throw new Error("Review not found.");
  if (existing.userId !== userId) {
    throw new Error("You can only delete your own review.");
  }

  await db.delete(reviews).where(eq(reviews.id, reviewId));
}
