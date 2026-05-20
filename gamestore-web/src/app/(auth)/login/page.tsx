import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/services/authService";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/games");
  }

  return (
    <div className="flex min-h-[calc(100vh-64px-300px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600">Welcome back to GameStore</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
