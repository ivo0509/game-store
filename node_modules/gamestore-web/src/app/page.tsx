import Link from "next/link";

import { getCurrentUser } from "@/services/authService";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-[calc(100vh-64px-300px)] flex items-center justify-center px-4">
      <div className="max-w-3xl w-full">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Welcome to <span className="text-blue-600">GameStore</span>
            </h1>
            <p className="text-xl text-gray-600">
              Discover and purchase your favorite games in one place
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="font-semibold text-gray-900 mb-2">Huge Library</h3>
              <p className="text-gray-600">
                Browse thousands of games from all genres
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Checkout</h3>
              <p className="text-gray-600">
                Safe and secure payment processing
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-900 mb-2">Game Library</h3>
              <p className="text-gray-600">
                Manage and organize your purchased games
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {user ? (
              <>
                <Link
                  href="/games"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-center"
                >
                  Browse Games
                </Link>
                <Link
                  href="/library"
                  className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors text-center"
                >
                  My Library
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors text-center"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Additional Info */}
          {!user && (
            <div className="text-gray-600 pt-4">
              <p>
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
