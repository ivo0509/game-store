import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken } from "@/lib/auth";
import { badRequestResponse, serverErrorResponse } from "@/lib/apiAuth";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body.");
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return badRequestResponse("Email and password are required.");
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isBlocked: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.isBlocked) {
      return Response.json({ error: "This account is blocked." }, { status: 403 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return Response.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return serverErrorResponse();
  }
}
