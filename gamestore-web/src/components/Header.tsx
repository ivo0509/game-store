'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">GameStore</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/games"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Games
            </Link>
            <Link
              href="/library"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Library
            </Link>
          </nav>

          {/* Auth Links - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-gray-800 transition-all ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-gray-800 transition-all ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-gray-800 transition-all ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-4 mt-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors block"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/games"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors block"
                onClick={() => setIsMenuOpen(false)}
              >
                Games
              </Link>
              <Link
                href="/library"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors block"
                onClick={() => setIsMenuOpen(false)}
              >
                Library
              </Link>
              <div className="border-t border-gray-200 pt-4 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
