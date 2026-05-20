import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  games,
  orderItems,
  orders,
  reviews,
  users,
} from "@/db/schema";

export type UserRole = "user" | "publisher" | "admin";
export type GameStatusAdmin = "draft" | "published" | "blocked";

// ─── Users ────────────────────────────────────────────────────────────────────

export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  photoUrl: string | null;
  createdAt: Date;
  gamesPublished: number;
  ordersPlaced: number;
};

export async function listAllUsers(): Promise<AdminUserRow[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isBlocked: users.isBlocked,
      photoUrl: users.photoUrl,
      createdAt: users.createdAt,
      gamesPublished: sql<number>`(
        SELECT COUNT(*)::int FROM ${games} WHERE ${games.publisherId} = ${users.id}
      )`,
      ordersPlaced: sql<number>`(
        SELECT COUNT(*)::int FROM ${orders} WHERE ${orders.userId} = ${users.id}
      )`,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return rows as AdminUserRow[];
}

export async function listAllPublishers(): Promise<AdminUserRow[]> {
  const rows = await listAllUsers();
  return rows.filter((u) => u.role === "publisher" || u.role === "admin");
}

export async function setUserBlocked(userId: number, isBlocked: boolean) {
  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true },
  });
  if (!target) throw new Error("User not found.");
  if (target.role === "admin") {
    throw new Error("Admin accounts cannot be blocked.");
  }

  await db
    .update(users)
    .set({ isBlocked, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function setUserRole(
  actingAdminId: number,
  userId: number,
  role: UserRole
) {
  if (role !== "user" && role !== "publisher" && role !== "admin") {
    throw new Error("Invalid role.");
  }

  if (actingAdminId === userId && role !== "admin") {
    throw new Error("You cannot demote yourself.");
  }

  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true },
  });
  if (!target) throw new Error("User not found.");

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ─── Games ────────────────────────────────────────────────────────────────────

export type AdminGameRow = {
  id: number;
  title: string;
  genre: string;
  status: GameStatusAdmin;
  price: string;
  discountPercent: number;
  publisherId: number;
  publisherName: string;
  publisherEmail: string;
  createdAt: Date;
  purchases: number;
  revenue: string;
};

export async function listAllGames(): Promise<AdminGameRow[]> {
  const rows = await db
    .select({
      id: games.id,
      title: games.title,
      genre: games.genre,
      status: games.status,
      price: games.price,
      discountPercent: games.discountPercent,
      publisherId: games.publisherId,
      publisherName: users.name,
      publisherEmail: users.email,
      createdAt: games.createdAt,
      purchases: sql<number>`COALESCE(COUNT(${orderItems.id})::int, 0)`,
      revenue: sql<string>`COALESCE(SUM(${orderItems.finalPrice}), 0)::text`,
    })
    .from(games)
    .innerJoin(users, eq(users.id, games.publisherId))
    .leftJoin(
      orderItems,
      and(
        eq(orderItems.gameId, games.id),
        sql`EXISTS (SELECT 1 FROM ${orders} WHERE ${orders.id} = ${orderItems.orderId} AND ${orders.status} = 'paid')`
      )
    )
    .groupBy(games.id, users.id)
    .orderBy(desc(games.createdAt));

  return rows as AdminGameRow[];
}

export async function setGameBlocked(gameId: number, blocked: boolean) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
    columns: { id: true, status: true },
  });
  if (!game) throw new Error("Game not found.");

  const next: GameStatusAdmin = blocked
    ? "blocked"
    : game.status === "blocked"
      ? "draft"
      : game.status;

  await db
    .update(games)
    .set({ status: next, updatedAt: new Date() })
    .where(eq(games.id, gameId));
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type AdminOrderRow = {
  id: number;
  buyerId: number;
  buyerName: string;
  buyerEmail: string;
  totalPrice: string;
  status: "pending" | "paid" | "cancelled";
  createdAt: Date;
  itemCount: number;
};

export async function listAllOrders(): Promise<AdminOrderRow[]> {
  const rows = await db
    .select({
      id: orders.id,
      buyerId: users.id,
      buyerName: users.name,
      buyerEmail: users.email,
      totalPrice: orders.totalPrice,
      status: orders.status,
      createdAt: orders.createdAt,
      itemCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id}
      )`,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .orderBy(desc(orders.createdAt));

  return rows as AdminOrderRow[];
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export type AdminReviewRow = {
  id: number;
  rating: number;
  comment: string;
  createdAt: Date;
  authorId: number;
  authorName: string;
  authorEmail: string;
  gameId: number;
  gameTitle: string;
};

export async function listAllReviews(): Promise<AdminReviewRow[]> {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      authorId: users.id,
      authorName: users.name,
      authorEmail: users.email,
      gameId: games.id,
      gameTitle: games.title,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .innerJoin(games, eq(games.id, reviews.gameId))
    .orderBy(desc(reviews.createdAt));

  return rows;
}

export async function deleteReview(reviewId: number) {
  const existing = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    columns: { id: true },
  });
  if (!existing) throw new Error("Review not found.");

  await db.delete(reviews).where(eq(reviews.id, reviewId));
}

// ─── Platform Statistics ──────────────────────────────────────────────────────

export type PlatformStats = {
  totalUsers: number;
  totalPublishers: number;
  totalAdmins: number;
  blockedUsers: number;
  totalGames: number;
  publishedGames: number;
  blockedGames: number;
  totalOrders: number;
  paidOrders: number;
  totalReviews: number;
  averageRating: number;
  grossRevenue: string;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const userRows = await db
    .select({
      totalUsers: sql<number>`COUNT(*)::int`,
      totalPublishers: sql<number>`COUNT(*) FILTER (WHERE ${users.role} = 'publisher')::int`,
      totalAdmins: sql<number>`COUNT(*) FILTER (WHERE ${users.role} = 'admin')::int`,
      blockedUsers: sql<number>`COUNT(*) FILTER (WHERE ${users.isBlocked} = true)::int`,
    })
    .from(users);

  const gameRows = await db
    .select({
      totalGames: sql<number>`COUNT(*)::int`,
      publishedGames: sql<number>`COUNT(*) FILTER (WHERE ${games.status} = 'published')::int`,
      blockedGames: sql<number>`COUNT(*) FILTER (WHERE ${games.status} = 'blocked')::int`,
    })
    .from(games);

  const orderRows = await db
    .select({
      totalOrders: sql<number>`COUNT(*)::int`,
      paidOrders: sql<number>`COUNT(*) FILTER (WHERE ${orders.status} = 'paid')::int`,
    })
    .from(orders);

  const reviewRows = await db
    .select({
      totalReviews: sql<number>`COUNT(*)::int`,
      averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)::float`,
    })
    .from(reviews);

  const revenueRows = await db
    .select({
      gross: sql<string>`COALESCE(SUM(${orderItems.finalPrice}), 0)::text`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(eq(orders.status, "paid"));

  return {
    totalUsers: userRows[0]?.totalUsers ?? 0,
    totalPublishers: userRows[0]?.totalPublishers ?? 0,
    totalAdmins: userRows[0]?.totalAdmins ?? 0,
    blockedUsers: userRows[0]?.blockedUsers ?? 0,
    totalGames: gameRows[0]?.totalGames ?? 0,
    publishedGames: gameRows[0]?.publishedGames ?? 0,
    blockedGames: gameRows[0]?.blockedGames ?? 0,
    totalOrders: orderRows[0]?.totalOrders ?? 0,
    paidOrders: orderRows[0]?.paidOrders ?? 0,
    totalReviews: reviewRows[0]?.totalReviews ?? 0,
    averageRating: reviewRows[0]?.averageRating ?? 0,
    grossRevenue: revenueRows[0]?.gross ?? "0",
  };
}
