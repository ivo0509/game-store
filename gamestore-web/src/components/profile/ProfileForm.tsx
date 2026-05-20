"use client";

import { useActionState } from "react";

import {
  updateProfileAction,
  type ProfileFormState,
} from "@/app/actions/profileActions";
import type { UserProfile } from "@/services/profileService";

const initialState: ProfileFormState = {};

export default function ProfileForm({ profile }: { profile: UserProfile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {state.success}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          value={profile.email}
          readOnly
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500"
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={profile.name}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="photoUrl"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Photo URL
        </label>
        <input
          id="photoUrl"
          name="photoUrl"
          defaultValue={profile.photoUrl ?? ""}
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
