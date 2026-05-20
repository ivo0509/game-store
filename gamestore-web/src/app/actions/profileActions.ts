"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import {
  changeUserPassword,
  updateUserProfile,
} from "@/services/profileService";

export type ProfileFormState = {
  error?: string;
  success?: string;
};

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    const session = await requireSession();
    const photoUrl = String(formData.get("photoUrl") ?? "").trim();
    await updateUserProfile(session.userId, {
      name: String(formData.get("name") ?? ""),
      photoUrl: photoUrl || null,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to update profile.",
    };
  }

  revalidatePath("/profile");
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const session = await requireSession();
    await changeUserPassword(session.userId, {
      currentPassword: String(formData.get("currentPassword") ?? ""),
      newPassword,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to change password.",
    };
  }

  return { success: "Password changed." };
}
