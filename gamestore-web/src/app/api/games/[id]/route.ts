import { and, count, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { cartItems, games, orderItems, orders, reviews, users } from "@/db/schema";
import {
  verifyBearerToken,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";
import {
  getReviewEligibility,
  getReviewsForGame,
  getUserReviewForGame,
} from "@/services/reviewsService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) return notFoundResponse("Invalid game id.");

  try {
    const game = await db.query.games.findFirst({
      where: and(eq(games.id, gameId), eq(games.status, "published")),
      columns: {
        id: true,
        title: true,
        description: true,
        genre: true,
        platforms: true,
        releaseDate: true,
        price: true,
        discountPercent: true,
        coverImageUrl: true,
        trailerUrl: true,
        ageRating: true,
      },
    });

    if (!game) return notFoundResponse("Game not found.");

    // Check if the requesting user has purchased this game
    const purchasedRows = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, session.userId),
          eq(orderItems.gameId, gameId),
          eq(orders.status, "paid")
        )
      )
      .limit(1);
    const isPurchased = purchasedRows.length > 0;

    // Check if the game is in the user's cart
    const cartRows = await db
      .select({ id: cartItems.id })
      .from(cartItems)
      .where(
        and(eq(cartItems.userId, session.userId), eq(cartItems.gameId, gameId))
      )
      .limit(1);
    const isInCart = cartRows.length > 0;

    // Count total users who purchased this game
    const [purchaseCountRow] = await db
      .select({ total: count() })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(eq(orderItems.gameId, gameId), eq(orders.status, "paid"))
      );
    const purchasedCount = purchaseCountRow?.total ?? 0;

    // Load reviews
    const gameReviews = await getReviewsForGame(gameId);
    const eligibility = await getReviewEligibility(session.userId, gameId);
    const userReview = await getUserReviewForGame(session.userId, gameId);

    return Response.json({
      ...game,
      isPurchased,
      isInCart,
      purchasedCount,
      canReview: eligibility.canReview,
      canReviewReason: eligibility.reason,
      userReview: userReview
        ? {
            id: userReview.id,
            rating: userReview.rating,
            comment: userReview.comment,
            createdAt: userReview.createdAt,
            updatedAt: userReview.updatedAt,
          }
        : null,
      reviews: gameReviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        rating: r.rating,
        comment: r.comment,
        authorName: r.authorName,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/games/[id]]", err);
    return serverErrorResponse();
  }
}
