import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/services/authService";

const NAV = [
  { href: "/publisher", label: "Dashboard" },
  { href: "/publisher/games", label: "My Games" },
  { href: "/publisher/sold", label: "Sold Games" },
];

export default async function PublisherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/publisher");
  }

  if (user.role !== "publisher" && user.role !== "admin") {
    redirect("/games");
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
