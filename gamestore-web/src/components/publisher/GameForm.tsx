"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
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

  const originalCover = initial?.coverImageUrl ?? "";
  const [coverUrl, setCoverUrl] = useState<string>(originalCover);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    const previousUrl = coverUrl;

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");

      setCoverUrl(data.url as string);

      // Best-effort delete of replaced upload, but never the original
      // (the original is still referenced by the saved game until form submit).
      if (previousUrl && previousUrl !== originalCover) {
        deleteUploadedFile(previousUrl);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemove() {
    const previousUrl = coverUrl;
    setCoverUrl("");
    setUploadError(null);
    if (previousUrl && previousUrl !== originalCover) {
      deleteUploadedFile(previousUrl);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field
        label="Title"
        name="title"
        defaultValue={initial?.title}
        minLength={2}
        maxLength={200}
        required
      />

      <Field
        label="Description"
        name="description"
        defaultValue={initial?.description}
        as="textarea"
        minLength={10}
        maxLength={5000}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Genre"
          name="genre"
          defaultValue={initial?.genre}
          minLength={2}
          maxLength={60}
          required
        />
        <Field
          label="Platforms (comma separated)"
          name="platforms"
          defaultValue={initial?.platforms.join(", ")}
          placeholder="PC, PS5, Xbox"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field
          label="Price (USD)"
          name="price"
          type="number"
          step="0.01"
          min="0"
          max="9999.99"
          defaultValue={initial?.price ?? "0.00"}
          required
        />
        <Field
          label="Discount %"
          name="discountPercent"
          type="number"
          step="1"
          min="0"
          max="100"
          defaultValue={String(initial?.discountPercent ?? 0)}
          required
        />
        <div>
          <label
            htmlFor="field-ageRating"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Age Rating
          </label>
          <select
            id="field-ageRating"
            name="ageRating"
            defaultValue={initial?.ageRating ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— None —</option>
            <option value="3+">3+</option>
            <option value="7+">7+</option>
            <option value="12+">12+</option>
            <option value="16+">16+</option>
            <option value="18+">18+</option>
            <option value="E">E (Everyone)</option>
            <option value="E10+">E10+</option>
            <option value="T">T (Teen)</option>
            <option value="M">M (Mature)</option>
            <option value="AO">AO (Adults Only)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="field-releaseDate"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Release Date
          </label>
          <input
            id="field-releaseDate"
            name="releaseDate"
            type="date"
            min="1970-01-01"
            max="2100-12-31"
            defaultValue={initial?.releaseDate ?? ""}
            onKeyDown={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>
        <CoverImageUploader
          coverUrl={coverUrl}
          uploading={uploading}
          uploadError={uploadError}
          onFileChange={handleFileChange}
          onRemove={handleRemove}
          fileInputRef={fileInputRef}
        />
      </div>

      <input type="hidden" name="coverImageUrl" value={coverUrl} />
      <input type="hidden" name="originalCoverImageUrl" value={originalCover} />

      <Field
        label="Trailer URL"
        name="trailerUrl"
        type="url"
        defaultValue={initial?.trailerUrl ?? ""}
        placeholder="https://youtube.com/..."
        pattern="https?://.*"
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
          disabled={isPending || uploading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending
            ? "Saving..."
            : uploading
            ? "Uploading..."
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

function deleteUploadedFile(url: string) {
  // Best-effort cleanup. Fire-and-forget; ignore errors.
  fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
    method: "DELETE",
  }).catch(() => {});
}

function CoverImageUploader({
  coverUrl,
  uploading,
  uploadError,
  onFileChange,
  onRemove,
  fileInputRef,
}: {
  coverUrl: string;
  uploading: boolean;
  uploadError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Cover Image
      </label>

      {coverUrl ? (
        <div className="space-y-2">
          <div className="relative w-full h-40 overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
            <Image
              src={coverUrl}
              alt="Cover preview"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={uploading}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-40 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Click to upload image"}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onFileChange}
        className="hidden"
      />

      {uploadError && (
        <p className="mt-1 text-xs text-red-600">{uploadError}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        JPG, PNG, WEBP, or GIF. Up to 5 MB.
      </p>
    </div>
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
  minLength?: number;
  maxLength?: number;
  pattern?: string;
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
