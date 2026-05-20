import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

const PASSWORD_SALT_ROUNDS = 12;

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  photoUrl: string | null;
  role: string;
};

export async function getUserProfile(
  userId: number
): Promise<UserProfile | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      role: true,
    },
  });

  return user ?? null;
}

export async function updateUserProfile(
  userId: number,
  input: { name: string; photoUrl: string | null }
) {
  const name = input.name.trim();
  if (name.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  if (input.photoUrl) {
    try {
      const url = new URL(input.photoUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error();
      }
    } catch {
      throw new Error("Photo URL must be a valid http(s) URL.");
    }
  }

  await db
    .update(users)
    .set({ name, photoUrl: input.photoUrl, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function changeUserPassword(
  userId: number,
  input: { currentPassword: string; newPassword: string }
) {
  if (input.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, passwordHash: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error("Current password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, PASSWORD_SALT_ROUNDS);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
