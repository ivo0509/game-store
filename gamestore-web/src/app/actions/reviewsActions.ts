"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import {
  createReview,
  deleteOwnReview,
  updateOwnReview,
} from "@/services/reviewsService";

export type ReviewFormState = {
  error?: string;
  success?: string;
};

function parseReviewInput(formData: FormData) {
  const rating = parseInt(String(formData.get("rating") ?? "0"), 10);
  const comment = String(formData.get("comment") ?? "");
  return { rating, comment };
}

export async function createReviewAction(
  gameId: number,
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  try {
    const session = await requireSession();
    await createReview(session.userId, gameId, parseReviewInput(formData));
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to post review.",
    };
  }

  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/publisher/games/${gameId}/reviews`);
  revalidatePath("/admin/reviews");
  return { success: "Review posted." };
}

export async function updateReviewAction(
  reviewId: number,
  gameId: number,
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  try {
    const session = await requireSession();
    await updateOwnReview(
      session.userId,
      reviewId,
      parseReviewInput(formData)
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to update review.",
    };
  }

  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/publisher/games/${gameId}/reviews`);
  revalidatePath("/admin/reviews");
  return { success: "Review updated." };
}

export async function deleteOwnReviewAction(
  reviewId: number,
  gameId: number
) {
  try {
    const session = await requireSession();
    await deleteOwnReview(session.userId, reviewId);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete review.",
    };
  }

  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/publisher/games/${gameId}/reviews`);
  revalidatePath("/admin/reviews");
  return { success: true };
}
