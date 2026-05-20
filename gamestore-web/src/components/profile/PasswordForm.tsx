"use client";

import { useActionState, useRef, useEffect } from "react";

import {
  changePasswordAction,
  type ProfileFormState,
} from "@/app/actions/profileActions";

const initialState: ProfileFormState = {};

export default function PasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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

      <Input
        label="Current Password"
        name="currentPassword"
        autoComplete="current-password"
      />
      <Input
        label="New Password"
        name="newPassword"
        autoComplete="new-password"
        minLength={8}
      />
      <Input
        label="Confirm New Password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={8}
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isPending ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}

function Input({
  label,
  name,
  ...rest
}: {
  label: string;
  name: string;
  autoComplete?: string;
  minLength?: number;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="password"
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...rest}
      />
    </div>
  );
}
