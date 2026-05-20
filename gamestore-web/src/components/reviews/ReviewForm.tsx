"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createReviewAction,
  deleteOwnReviewAction,
  updateReviewAction,
  type ReviewFormState,
} from "@/app/actions/reviewsActions";
import type { GameReviewView } from "@/services/reviewsService";

const initialState: ReviewFormState = {};

type Props = {
  gameId: number;
  existing: GameReviewView | null;
};

export default function ReviewForm({ gameId, existing }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const action = existing
    ? updateReviewAction.bind(null, existing.id, gameId)
    : createReviewAction.bind(null, gameId);

  const [state, formAction, isPending] = useActionState(action, initialState);
  const lastHandledState = useRef(state);

  // After a successful save of an edit, close the form automatically.
  // Only react to NEW state transitions, not the lingering success from a
  // previous save (otherwise re-opening edit would auto-close immediately).
  useEffect(() => {
    if (state === lastHandledState.current) return;
    lastHandledState.current = state;
    if (state.success && isEditing) {
      setIsEditing(false);
      router.refresh();
    }
  }, [state, isEditing, router]);

  // If user has an existing review and isn't editing, show it as a card
  if (existing && !isEditing) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-sm font-semibold text-blue-900">Your review</p>
            <p className="text-yellow-500 font-semibold">
              {"★".repeat(existing.rating)}
              <span className="text-gray-300">
                {"★".repeat(5 - existing.rating)}
              </span>
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Delete your review?")) return;
                const result = await deleteOwnReviewAction(
                  existing.id,
                  gameId
                );
                if (!result?.success) {
                  alert(result?.message ?? "Failed to delete.");
                } else {
                  router.refresh();
                }
              }}
              className="font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{existing.comment}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {existing ? "Edit your review" : "Write a review"}
      </h3>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {state.success}
        </div>
      )}

      <RatingPicker defaultValue={existing?.rating ?? 5} />

      <div>
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Comment
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          required
          defaultValue={existing?.comment ?? ""}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Share your thoughts..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending
            ? "Saving..."
            : existing
            ? "Save Changes"
            : "Post Review"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:border-blue-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function RatingPicker({ defaultValue }: { defaultValue: number }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Rating
      </label>
      <input type="hidden" name="rating" value={value} />
      <div className="flex gap-1 text-3xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
            className={`leading-none transition-transform hover:scale-110 ${
              n <= value ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
