import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken } from "@/lib/auth";
import { badRequestResponse, serverErrorResponse } from "@/lib/apiAuth";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_SALT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body.");
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (name.length < 2) {
    return badRequestResponse("Name must be at least 2 characters.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequestResponse("Enter a valid email address.");
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return badRequestResponse("Password must be at least 8 characters.");
  }

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });

    if (existing) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const [created] = await db
      .insert(users)
      .values({ name, email, passwordHash, role: "user" })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    const token = await createSessionToken({
      userId: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
    });

    return Response.json(
      {
        token,
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.role,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return serverErrorResponse();
  }
}
