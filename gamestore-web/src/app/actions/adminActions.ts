"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import {
  deleteReview,
  setGameBlocked,
  setUserBlocked,
  setUserRole,
  type UserRole,
} from "@/services/adminService";

export type AdminActionResult = {
  success: boolean;
  message?: string;
};

export async function setUserBlockedAction(
  userId: number,
  isBlocked: boolean
): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await setUserBlocked(userId, isBlocked);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update user.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/publishers");
  return { success: true };
}

export async function setUserRoleAction(
  userId: number,
  role: UserRole
): Promise<AdminActionResult> {
  try {
    const admin = await requireAdmin();
    await setUserRole(admin.userId, userId, role);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update role.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/publishers");
  return { success: true };
}

export async function setGameBlockedAction(
  gameId: number,
  blocked: boolean
): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await setGameBlocked(gameId, blocked);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update game.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/games");
  revalidatePath("/games");
  revalidatePath(`/games/${gameId}`);
  return { success: true };
}

export async function deleteReviewAction(
  reviewId: number
): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await deleteReview(reviewId);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete review.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  return { success: true };
}
