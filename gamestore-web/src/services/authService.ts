import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSessionToken,
  getSessionPayload,
  setAuthCookie,
  type AuthTokenPayload,
} from "@/lib/auth";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_SALT_ROUNDS = 12;

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role?: "user" | "publisher";
}) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const role: "user" | "publisher" =
    input.role === "publisher" ? "publisher" : "user";

  if (name.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error("Password must be at least 8 characters.");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const [createdUser] = await db
    .insert(users)
    .values({ name, email, passwordHash, role })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  await createUserSession(createdUser);
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

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
    throw new Error("Invalid email or password.");
  }

  if (user.isBlocked) {
    throw new Error("This account is blocked.");
  }

  await createUserSession(user);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSessionPayload();

  if (!session) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
    },
  });

  if (!user || user.isBlocked) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function createUserSession(user: AuthTokenPayload | CurrentUser) {
  const token = await createSessionToken({
    userId: "userId" in user ? user.userId : user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await setAuthCookie(token);
}
