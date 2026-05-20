import { redirect } from "next/navigation";

import PasswordForm from "@/components/profile/PasswordForm";
import ProfileForm from "@/components/profile/ProfileForm";
import { requireSession } from "@/lib/auth";
import { getUserProfile } from "@/services/profileService";

export default async function ProfilePage() {
  const session = await requireSession();
  const profile = await getUserProfile(session.userId);
  if (!profile) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-gray-600 mb-8 capitalize">{profile.role} account</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Personal Info
          </h2>
          <ProfileForm profile={profile} />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Change Password
          </h2>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
