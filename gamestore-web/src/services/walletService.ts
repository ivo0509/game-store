import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, games, orderItems, orders, users } from "@/db/schema";

// ─── Wallet ──────────────────────────────────────────────────────────────────────

export async function getWalletBalance(userId: number): Promise<string> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { walletBalance: true },
  });
  return row?.walletBalance ?? "0.00";
}

export async function addFunds(userId: number, amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { walletBalance: true },
  });
  const current = parseFloat(row?.walletBalance ?? "0");
  const newBalance = (current + amount).toFixed(2);

  await db
    .update(users)
    .set({ walletBalance: sql`${newBalance}::numeric` })
    .where(eq(users.id, userId));
}

// ─── Cart summary ────────────────────────────────────────────────────────────────

export type CartSummaryItem = {
  gameId: number;
  title: string;
  price: string;
  discountPercent: number;
  finalPrice: string;
  publisherId: number;
  status: string;
};

export async function getCartSummary(userId: number): Promise<CartSummaryItem[]> {
  const rows = await db
    .select({
      gameId: games.id,
      title: games.title,
      price: games.price,
      discountPercent: games.discountPercent,
      publisherId: games.publisherId,
      status: games.status,
    })
    .from(cartItems)
    .innerJoin(games, eq(cartItems.gameId, games.id))
    .where(eq(cartItems.userId, userId));

  return rows.map((r) => {
    const base = parseFloat(r.price);
    const final =
      r.discountPercent > 0 ? base * (1 - r.discountPercent / 100) : base;
    return {
      gameId: r.gameId,
      title: r.title,
      price: r.price,
      discountPercent: r.discountPercent,
      finalPrice: final.toFixed(2),
      publisherId: r.publisherId,
      status: r.status,
    };
  });
}

// ─── Checkout ────────────────────────────────────────────────────────────────────

export async function checkout(userId: number): Promise<{ orderId: number }> {
  // 1. Load cart items (only published games, not already owned)
  const cartRows = await db
    .select({
      gameId: games.id,
      title: games.title,
      price: games.price,
      discountPercent: games.discountPercent,
      publisherId: games.publisherId,
      status: games.status,
    })
    .from(cartItems)
    .innerJoin(games, eq(cartItems.gameId, games.id))
    .where(eq(cartItems.userId, userId));

  // Filter to only published games
  const eligibleItems = cartRows.filter((r) => r.status === "published");
  if (eligibleItems.length === 0) {
    throw new Error("Your cart has no published games to purchase.");
  }

  // 2. Check for already-owned games (paid orders)
  const alreadyOwned = await db
    .select({ gameId: orderItems.gameId })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orders.userId, userId), eq(orders.status, "paid")));

  const ownedGameIds = new Set(alreadyOwned.map((r) => r.gameId));
  const itemsToBuy = eligibleItems.filter((r) => !ownedGameIds.has(r.gameId));

  if (itemsToBuy.length === 0) {
    throw new Error("You already own all games in your cart.");
  }

  // 3. Calculate total
  const total = itemsToBuy.reduce((sum, r) => {
    const base = parseFloat(r.price);
    return (
      sum + (r.discountPercent > 0 ? base * (1 - r.discountPercent / 100) : base)
    );
  }, 0);

  // 4. Check buyer balance
  const buyer = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { walletBalance: true },
  });
  const balance = parseFloat(buyer?.walletBalance ?? "0");
  if (balance < total) {
    throw new Error("Insufficient balance.");
  }

  // 5. Find admin as fallback publisher recipient
  const adminUser = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
    columns: { id: true },
  });

  // 6. Deduct buyer balance
  const newBuyerBalance = (balance - total).toFixed(2);
  await db
    .update(users)
    .set({ walletBalance: sql`${newBuyerBalance}::numeric` })
    .where(eq(users.id, userId));

  // 7. Create paid order
  const [order] = await db
    .insert(orders)
    .values({ userId, totalPrice: total.toFixed(2), status: "paid" })
    .returning({ id: orders.id });

  // 8. Create order items & credit publishers
  for (const item of itemsToBuy) {
    const base = parseFloat(item.price);
    const final =
      item.discountPercent > 0
        ? base * (1 - item.discountPercent / 100)
        : base;

    await db.insert(orderItems).values({
      orderId: order.id,
      gameId: item.gameId,
      priceAtPurchase: item.price,
      discountAtPurchase: item.discountPercent,
      finalPrice: final.toFixed(2),
    });

    // Credit publisher; fall back to admin if publisher id is missing
    const recipientId = item.publisherId ?? adminUser?.id;
    if (recipientId) {
      const recipient = await db.query.users.findFirst({
        where: eq(users.id, recipientId),
        columns: { walletBalance: true },
      });
      const currentRecipientBalance = parseFloat(recipient?.walletBalance ?? "0");
      await db
        .update(users)
        .set({ walletBalance: sql`${(currentRecipientBalance + final).toFixed(2)}::numeric` })
        .where(eq(users.id, recipientId));
    }
  }

  // 9. Clear cart (remove all cartItems for this user)
  await db.delete(cartItems).where(eq(cartItems.userId, userId));

  return { orderId: order.id };
}

// ─── Refund ───────────────────────────────────────────────────────────────────

export async function refundGame(userId: number, gameId: number): Promise<void> {
  // 1. Find the paid order item for this user & game
  const rows = await db
    .select({
      orderItemId: orderItems.id,
      orderId: orderItems.orderId,
      finalPrice: orderItems.finalPrice,
      publisherId: games.publisherId,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(games, eq(orderItems.gameId, games.id))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orderItems.gameId, gameId),
        eq(orders.status, "paid")
      )
    )
    .limit(1);

  if (rows.length === 0) {
    throw new Error("No purchase found for this game.");
  }

  const { orderItemId, orderId, finalPrice, publisherId } = rows[0];
  const refundAmount = parseFloat(finalPrice);

  // 2. Refund buyer
  const buyer = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { walletBalance: true },
  });
  const newBuyerBalance = (parseFloat(buyer?.walletBalance ?? "0") + refundAmount).toFixed(2);
  await db
    .update(users)
    .set({ walletBalance: sql`${newBuyerBalance}::numeric` })
    .where(eq(users.id, userId));

  // 3. Deduct from publisher (floor at 0)
  const publisher = await db.query.users.findFirst({
    where: eq(users.id, publisherId),
    columns: { walletBalance: true },
  });
  const publisherCurrent = parseFloat(publisher?.walletBalance ?? "0");
  const newPublisherBalance = Math.max(0, publisherCurrent - refundAmount).toFixed(2);
  await db
    .update(users)
    .set({ walletBalance: sql`${newPublisherBalance}::numeric` })
    .where(eq(users.id, publisherId));

  // 4. Delete the order item
  await db.delete(orderItems).where(eq(orderItems.id, orderItemId));

  // 5. If the order has no remaining items, delete the order
  const remaining = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .limit(1);

  if (remaining.length === 0) {
    await db.delete(orders).where(eq(orders.id, orderId));
  }
}

