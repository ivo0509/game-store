import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  users,
  games,
  orders,
  orderItems,
  cartItems,
  wishlistItems,
  reviews,
} from "./schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcFinalPrice(price: string, discountPercent: number): string {
  const final = parseFloat(price) * (1 - discountPercent / 100);
  return final.toFixed(2);
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding database...");

  // Clear existing data in dependency order
  await db.delete(reviews);
  await db.delete(wishlistItems);
  await db.delete(cartItems);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(games);
  await db.delete(users);

  const passwordHash = await bcrypt.hash("pass123", 10);

  // ── Users ────────────────────────────────────────────────────────────────

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: "Steve Johnson",
        email: "steve@gmail.com",
        passwordHash,
        role: "publisher",
      },
      {
        name: "Peter Parker",
        email: "peter@gmail.com",
        passwordHash,
        role: "publisher",
      },
      {
        name: "Dave Miller",
        email: "dave@gmail.com",
        passwordHash,
        role: "user",
      },
      {
        name: "John Smith",
        email: "john@gmail.com",
        passwordHash,
        role: "user",
      },
      {
        name: "Nick Brown",
        email: "nick@gmail.com",
        passwordHash,
        role: "user",
      },
      ...Array.from({ length: 9 }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@gmail.com`,
        passwordHash,
        role: "user" as const,
      })),
    ])
    .returning();

  const byEmail = Object.fromEntries(
    insertedUsers.map((u) => [u.email, u])
  ) as Record<string, (typeof insertedUsers)[number]>;

  const steve = byEmail["steve@gmail.com"];
  const peter = byEmail["peter@gmail.com"];
  const dave = byEmail["dave@gmail.com"];
  const john = byEmail["john@gmail.com"];
  const nick = byEmail["nick@gmail.com"];
  const numbered = Array.from(
    { length: 9 },
    (_, i) => byEmail[`user${i + 1}@gmail.com`]
  );

  console.log(`  ✓ ${insertedUsers.length} users created`);

  // ── Games ────────────────────────────────────────────────────────────────

  const gamesData = [
    {
      publisherId: steve.id,
      title: "Counter-Strike 2",
      description:
        "Counter-Strike 2 is a free-to-play tactical first-person shooter where two teams — terrorists and counter-terrorists — compete across various objective-based game modes.",
      genre: "Action",
      platforms: ["PC"],
      releaseDate: "2023-09-27",
      price: "0.00",
      discountPercent: 0,
      coverImageUrl:
        "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=PBTtBMqMEKo",
      ageRating: "18+",
      status: "published" as const,
      ownerEmails: [
        steve.email,
        dave.email,
        nick.email,
        ...numbered.map((u) => u.email),
      ],
    },
    {
      publisherId: peter.id,
      title: "Fortnite",
      description:
        "Fortnite is a free-to-play battle royale game where 100 players skydive onto an island, gather resources, build structures, and fight to be the last one standing.",
      genre: "Action",
      platforms: ["PC", "PlayStation", "Xbox"],
      releaseDate: "2017-07-25",
      price: "0.00",
      discountPercent: 0,
      coverImageUrl:
        "https://cdn2.unrealengine.com/fortnite-chapter-4-season-4-1920x1080-6c3c4ba78bb0.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=VeAJ27eJFMc",
      ageRating: "12+",
      status: "published" as const,
      ownerEmails: [
        steve.email,
        peter.email,
        john.email,
        ...numbered.map((u) => u.email),
      ],
    },
    {
      publisherId: steve.id,
      title: "Minecraft",
      description:
        "Minecraft is a sandbox game where players explore procedurally generated worlds, mine resources, craft tools, build structures, and survive against creatures.",
      genre: "Sandbox",
      platforms: ["PC", "PlayStation", "Xbox"],
      releaseDate: "2011-11-18",
      price: "29.99",
      discountPercent: 0,
      coverImageUrl:
        "https://www.minecraft.net/content/dam/games/minecraft/key-art/MC_Thumbnail_02.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=MmB9b5njVbA",
      ageRating: "7+",
      status: "published" as const,
      ownerEmails: [
        peter.email,
        dave.email,
        john.email,
        ...numbered.slice(0, 5).map((u) => u.email),
      ],
    },
    {
      publisherId: peter.id,
      title: "Grand Theft Auto V",
      description:
        "GTA V is an open-world action-adventure game set in the fictional city of Los Santos. Play as three protagonists pulling off heists and living life on the criminal edge.",
      genre: "Action",
      platforms: ["PC", "PlayStation", "Xbox"],
      releaseDate: "2013-09-17",
      price: "29.99",
      discountPercent: 50,
      coverImageUrl:
        "https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png",
      trailerUrl: "https://www.youtube.com/watch?v=QkkoHAzjnUs",
      ageRating: "18+",
      status: "published" as const,
      ownerEmails: [
        steve.email,
        dave.email,
        nick.email,
        ...numbered.slice(0, 7).map((u) => u.email),
      ],
    },
    {
      publisherId: steve.id,
      title: "The Witcher 3: Wild Hunt",
      description:
        "The Witcher 3 is an open-world RPG where you play as Geralt of Rivia, a monster hunter navigating a war-ravaged continent filled with meaningful choices and rich storytelling.",
      genre: "RPG",
      platforms: ["PC", "PlayStation"],
      releaseDate: "2015-05-19",
      price: "39.99",
      discountPercent: 75,
      coverImageUrl:
        "https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=c0i88t0Kacs",
      ageRating: "18+",
      status: "published" as const,
      ownerEmails: [
        peter.email,
        john.email,
        ...numbered.map((u) => u.email),
      ],
    },
    {
      publisherId: peter.id,
      title: "Red Dead Redemption 2",
      description:
        "RDR2 is an epic open-world action-adventure set in 1899 America. Experience outlaw life as Arthur Morgan, navigating loyalty, morality, and the dying age of the Wild West.",
      genre: "Action",
      platforms: ["PC", "PlayStation", "Xbox"],
      releaseDate: "2018-10-26",
      price: "59.99",
      discountPercent: 40,
      coverImageUrl:
        "https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=eaW0tYpxyp0",
      ageRating: "18+",
      status: "published" as const,
      ownerEmails: [
        steve.email,
        dave.email,
        nick.email,
        john.email,
        ...numbered.slice(0, 6).map((u) => u.email),
      ],
    },
  ];

  const insertedGames = await db
    .insert(games)
    .values(
      gamesData.map(({ ownerEmails: _owners, ...g }) => g)
    )
    .returning();

  console.log(`  ✓ ${insertedGames.length} games created`);

  // ── Orders & Order Items (simulate ownership) ─────────────────────────────
  // Group all owned games per user, then create one order per user.

  const ownershipMap: Map<number, typeof insertedGames> = new Map();

  for (let i = 0; i < gamesData.length; i++) {
    const game = insertedGames[i];
    const ownerEmails = gamesData[i].ownerEmails;
    for (const email of ownerEmails) {
      const user = byEmail[email];
      if (!user) continue;
      if (!ownershipMap.has(user.id)) ownershipMap.set(user.id, []);
      ownershipMap.get(user.id)!.push(game);
    }
  }

  // Build a lookup of game data by game id for price info
  const gameDataById = Object.fromEntries(
    gamesData.map((g, i) => [insertedGames[i].id, g])
  );

  let orderCount = 0;
  let orderItemCount = 0;

  for (const [userId, ownedGames] of ownershipMap) {
    const items = ownedGames.map((g) => {
      const data = gameDataById[g.id];
      return {
        gameId: g.id,
        priceAtPurchase: data.price,
        discountAtPurchase: data.discountPercent,
        finalPrice: calcFinalPrice(data.price, data.discountPercent),
      };
    });

    const totalPrice = items
      .reduce((sum, item) => sum + parseFloat(item.finalPrice), 0)
      .toFixed(2);

    const [order] = await db
      .insert(orders)
      .values({ userId, totalPrice, status: "paid" })
      .returning();

    await db.insert(orderItems).values(
      items.map((item) => ({ orderId: order.id, ...item }))
    );

    orderCount++;
    orderItemCount += items.length;
  }

  console.log(`  ✓ ${orderCount} orders created`);
  console.log(`  ✓ ${orderItemCount} order items created`);

  console.log("\nSeeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
