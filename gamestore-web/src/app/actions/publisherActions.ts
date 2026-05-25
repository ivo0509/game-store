"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePublisher } from "@/lib/auth";
import { deleteR2ObjectByUrl } from "@/lib/r2";
import {
  createPublisherGame,
  deletePublisherGame,
  getPublisherGameById,
  updatePublisherGame,
  updatePublisherGameStatus,
  type GameStatus,
  type PublisherGameInput,
} from "@/services/publisherService";

export type PublisherFormState = {
  error?: string;
};

function parseInput(formData: FormData): PublisherGameInput {
  const platforms = String(formData.get("platforms") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const releaseDate = String(formData.get("releaseDate") ?? "").trim();
  const trailerUrl = String(formData.get("trailerUrl") ?? "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const ageRating = String(formData.get("ageRating") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as GameStatus;
  const discountPercent = parseInt(
    String(formData.get("discountPercent") ?? "0"),
    10
  );

  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    genre: String(formData.get("genre") ?? ""),
    platforms,
    releaseDate: releaseDate || null,
    price: String(formData.get("price") ?? "0"),
    discountPercent: Number.isFinite(discountPercent) ? discountPercent : 0,
    coverImageUrl: coverImageUrl || null,
    trailerUrl: trailerUrl || null,
    ageRating: ageRating || null,
    status,
  };
}

export async function createGameAction(
  _prev: PublisherFormState,
  formData: FormData
): Promise<PublisherFormState> {
  let newGameId: number;
  try {
    const session = await requirePublisher();
    const created = await createPublisherGame(
      session.userId,
      parseInput(formData)
    );
    newGameId = created.id;
  } catch (error) {
    // Cleanup: delete the uploaded cover if game creation failed.
    const submittedCover = String(formData.get("coverImageUrl") ?? "").trim();
    if (submittedCover) {
      await deleteR2ObjectByUrl(submittedCover);
    }
    return {
      error: error instanceof Error ? error.message : "Failed to create game.",
    };
  }

  revalidatePath("/publisher");
  revalidatePath("/publisher/games");
  revalidatePath("/games");
  redirect("/games");
}

export async function updateGameAction(
  gameId: number,
  _prev: PublisherFormState,
  formData: FormData
): Promise<PublisherFormState> {
  let oldCoverUrl: string | null = null;
  let newCoverUrl: string | null = null;
  try {
    const session = await requirePublisher();
    const existing = await getPublisherGameById(session.userId, gameId);
    oldCoverUrl = existing?.coverImageUrl ?? null;

    const input = parseInput(formData);
    newCoverUrl = input.coverImageUrl;
    await updatePublisherGame(session.userId, gameId, input);
  } catch (error) {
    // Cleanup: if a new image was uploaded but save failed, delete it.
    const submittedCover = String(formData.get("coverImageUrl") ?? "").trim();
    const originalCover = String(formData.get("originalCoverImageUrl") ?? "").trim();
    if (submittedCover && submittedCover !== originalCover) {
      await deleteR2ObjectByUrl(submittedCover);
    }
    return {
      error: error instanceof Error ? error.message : "Failed to update game.",
    };
  }

  // After successful save, delete the replaced cover image if it changed.
  if (oldCoverUrl && oldCoverUrl !== newCoverUrl) {
    await deleteR2ObjectByUrl(oldCoverUrl);
  }

  revalidatePath("/publisher");
  revalidatePath("/publisher/games");
  revalidatePath(`/publisher/games/${gameId}/edit`);
  revalidatePath("/games");
  revalidatePath(`/games/${gameId}`);
  redirect(`/games/${gameId}`);
}

export async function changeGameStatusAction(
  gameId: number,
  status: GameStatus
) {
  try {
    const session = await requirePublisher();
    await updatePublisherGameStatus(session.userId, gameId, status);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to change status.",
    };
  }

  revalidatePath("/publisher");
  revalidatePath("/publisher/games");
  revalidatePath("/games");
  revalidatePath(`/games/${gameId}`);
  return { success: true };
}

export async function deleteGameAction(gameId: number) {
  let coverUrl: string | null = null;
  try {
    const session = await requirePublisher();
    const existing = await getPublisherGameById(session.userId, gameId);
    coverUrl = existing?.coverImageUrl ?? null;
    await deletePublisherGame(session.userId, gameId);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete game.",
    };
  }

  if (coverUrl) {
    await deleteR2ObjectByUrl(coverUrl);
  }

  revalidatePath("/publisher");
  revalidatePath("/publisher/games");
  revalidatePath("/games");
  return { success: true };
}
