import { count, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { games } from "@/db/schema";
import {
  verifyBearerToken,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/apiAuth";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const session = await verifyBearerToken(request);
  if (!session) return unauthorizedResponse();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;

  if (isNaN(page) || isNaN(limit)) {
    return badRequestResponse("Invalid page or limit parameter.");
  }

  try {
    const [totalRow] = await db
      .select({ total: count() })
      .from(games)
      .where(eq(games.status, "published"));

    const total = totalRow?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

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
      .orderBy(games.createdAt)
      .limit(limit)
      .offset(offset);

    return Response.json({
      data: rows,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    console.error("[GET /api/games]", err);
    return serverErrorResponse();
  }
}
