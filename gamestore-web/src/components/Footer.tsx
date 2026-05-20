import Link from "next/link";

import { getCurrentUser } from "../services/authService";

export default async function Footer() {
  const user = await getCurrentUser();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-blue-400 mb-2">GameStore</div>
            <p className="text-gray-400">
              Your ultimate destination for digital games. Browse, purchase, and manage your game library.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-blue-400 transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-blue-400 transition-colors">
                  Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              {user ? (
                <>
                  <li>
                    <Link href="/library" className="hover:text-blue-400 transition-colors">
                      My Library
                    </Link>
                  </li>
                  <li className="text-gray-400">
                    Signed in as {user.name}
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="hover:text-blue-400 transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-blue-400 transition-colors">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} GameStore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
