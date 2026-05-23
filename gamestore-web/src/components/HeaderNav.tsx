"use client";

import Link from "next/link";
import { useState } from "react";

import { logoutAction } from "@/app/actions/authActions";
import type { CurrentUser } from "@/services/authService";

type HeaderNavProps = {
  user: CurrentUser | null;
};

export default function HeaderNav({ user }: HeaderNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">GameStore</div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
              Home
            </Link>
            <Link href="/games" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
              Games
            </Link>
            {(!user || user.role === "user") && (
              <Link href="/library" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                Library
              </Link>
            )}
            {user && user.role === "user" && (
              <>
                <Link href="/checkout" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                  Cart
                </Link>
                <Link href="/wallet" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                  Wallet
                </Link>
              </>
            )}
            {(user?.role === "publisher" || user?.role === "admin") && (
              <Link href="/wallet" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                Earnings
              </Link>
            )}
            {(user?.role === "publisher" || user?.role === "admin") && (
              <Link href="/publisher" className="font-medium text-blue-600 transition-colors hover:text-blue-700">
                Publisher
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className="font-medium text-purple-600 transition-colors hover:text-purple-700">
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <AuthControls user={user} />
          </div>

          <button
            className="flex flex-col gap-1.5 p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            type="button"
          >
            <span className={`h-0.5 w-6 bg-gray-800 transition-all ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-gray-800 transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-gray-800 transition-all ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>

        {isMenuOpen && (
          <nav className="border-t border-gray-200 pb-4 md:hidden">
            <div className="mt-4 flex flex-col gap-4">
              <MobileLink href="/" onClick={() => setIsMenuOpen(false)}>Home</MobileLink>
              <MobileLink href="/games" onClick={() => setIsMenuOpen(false)}>Games</MobileLink>
              {(!user || user.role === "user") && (
                <MobileLink href="/library" onClick={() => setIsMenuOpen(false)}>Library</MobileLink>
              )}
              {user && user.role === "user" && (
                <>
                  <MobileLink href="/checkout" onClick={() => setIsMenuOpen(false)}>Cart</MobileLink>
                  <MobileLink href="/wallet" onClick={() => setIsMenuOpen(false)}>Wallet</MobileLink>
                </>
              )}
              {(user?.role === "publisher" || user?.role === "admin") && (
                <MobileLink href="/wallet" onClick={() => setIsMenuOpen(false)}>Earnings</MobileLink>
              )}
              {(user?.role === "publisher" || user?.role === "admin") && (
                <MobileLink href="/publisher" onClick={() => setIsMenuOpen(false)}>Publisher</MobileLink>
              )}
              {user?.role === "admin" && (
                <MobileLink href="/admin" onClick={() => setIsMenuOpen(false)}>Admin</MobileLink>
              )}
              {user && (
                <MobileLink href="/profile" onClick={() => setIsMenuOpen(false)}>Profile</MobileLink>
              )}
              <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
                <AuthControls user={user} isMobile />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

function AuthControls({
  user,
  isMobile = false,
}: HeaderNavProps & { isMobile?: boolean }) {
  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className={isMobile ? "block px-4 py-2 text-center font-medium text-gray-700 transition-colors hover:text-blue-600" : "px-4 py-2 font-medium text-gray-700 transition-colors hover:text-blue-600"}
        >
          Login
        </Link>
        <Link
          href="/register"
          className={isMobile ? "block rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700" : "rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"}
        >
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/profile"
        className={isMobile ? "text-center" : "text-right"}
      >
        <p className="text-sm font-semibold text-gray-900 hover:text-blue-600">{user.name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className={isMobile ? "w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:border-blue-600 hover:text-blue-600" : "rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:border-blue-600 hover:text-blue-600"}
        >
          Logout
        </button>
      </form>
    </>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block font-medium text-gray-700 transition-colors hover:text-blue-600"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
