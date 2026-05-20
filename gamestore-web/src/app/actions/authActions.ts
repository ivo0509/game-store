"use server";

import { redirect } from "next/navigation";

import { clearAuthCookie } from "@/lib/auth";
import { loginUser, registerUser } from "@/services/authService";

export type AuthActionState = {
  error?: string;
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    await loginUser({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
    };
  }

  redirect("/games");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const role = String(formData.get("role") ?? "user") === "publisher" ? "publisher" : "user";

  try {
    await registerUser({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password,
      role,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
    };
  }

  redirect("/games");
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/");
}
