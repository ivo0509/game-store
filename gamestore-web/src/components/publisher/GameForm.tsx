"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import {
  changeGameStatusAction,
  deleteGameAction,
  createGameAction,
  updateGameAction,
  type PublisherFormState,
} from "@/app/actions/publisherActions";
import type {
  GameStatus,
  PublisherGame,
} from "@/services/publisherService";

const initialState: PublisherFormState = {};

type Props = {
  mode: "create" | "edit";
  initial?: PublisherGame;
};

export default function GameForm({ mode, initial }: Props) {
  const action =
    mode === "edit" && initial
      ? updateGameAction.bind(null, initial.id)
      : createGameAction;

  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field label="Title" name="title" defaultValue={initial?.title} required />

      <Field
        label="Description"
        name="description"
        defaultValue={initial?.description}
        as="textarea"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Genre"
          name="genre"
          defaultValue={initial?.genre}
          required
        />
        <Field
          label="Platforms (comma separated)"
          name="platforms"
          defaultValue={initial?.platforms.join(", ")}
          placeholder="PC, PS5, Xbox"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field
          label="Price (USD)"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial?.price ?? "0.00"}
          required
        />
        <Field
          label="Discount %"
          name="discountPercent"
          type="number"
          min="0"
          max="100"
          defaultValue={String(initial?.discountPercent ?? 0)}
        />
        <Field
          label="Age Rating"
          name="ageRating"
          defaultValue={initial?.ageRating ?? ""}
          placeholder="18+"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Release Date"
          name="releaseDate"
          type="date"
          defaultValue={initial?.releaseDate ?? ""}
        />
        <Field
          label="Cover Image URL"
          name="coverImageUrl"
          defaultValue={initial?.coverImageUrl ?? ""}
          placeholder="https://..."
        />
      </div>

      <Field
        label="Trailer URL"
        name="trailerUrl"
        defaultValue={initial?.trailerUrl ?? ""}
        placeholder="https://youtube.com/..."
      />

      <div>
        <label
          htmlFor="status"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={initial?.status ?? "draft"}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending
            ? "Saving..."
            : mode === "create"
            ? "Create Game"
            : "Save Changes"}
        </button>
        {mode === "edit" && initial && (
          <EditActionButtons gameId={initial.id} status={initial.status} />
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  as = "input",
  ...rest
}: {
  label: string;
  name: string;
  as?: "input" | "textarea";
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;
}) {
  const id = `field-${name}`;
  const common =
    "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {as === "textarea" ? (
        <textarea id={id} name={name} rows={5} className={common} {...rest} />
      ) : (
        <input id={id} name={name} className={common} {...rest} />
      )}
    </div>
  );
}

function EditActionButtons({
  gameId,
  status,
}: {
  gameId: number;
  status: GameStatus;
}) {
  const router = useRouter();
  const isBlocked = status === "blocked";
  const toggleTarget: GameStatus = status === "published" ? "draft" : "published";

  return (
    <>
      <button
        type="button"
        disabled={isBlocked}
        onClick={async () => {
          const result = await changeGameStatusAction(gameId, toggleTarget);
          if (!result?.success) {
            alert(result?.message ?? "Failed to change status.");
          } else {
            router.refresh();
          }
        }}
        className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
      >
        {status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        onClick={async () => {
          if (
            !confirm(
              "Delete this game? This cannot be undone. Games already purchased cannot be deleted."
            )
          ) {
            return;
          }
          const result = await deleteGameAction(gameId);
          if (!result?.success) {
            alert(result?.message ?? "Failed to delete.");
          } else {
            router.push("/publisher/games");
            router.refresh();
          }
        }}
        className="ml-auto rounded-lg border border-red-300 px-5 py-2.5 font-semibold text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </>
  );
}
