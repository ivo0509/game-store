import { redirect } from "next/navigation";

import { getCurrentUser } from "@/services/authService";

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

  return <div className="bg-gray-50">{children}</div>;
}
