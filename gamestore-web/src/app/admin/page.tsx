import { requireAdmin } from "@/lib/auth";
import { getPlatformStats } from "@/services/adminService";

function formatMoney(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getPlatformStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-8">Platform statistics at a glance</p>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Users
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Publishers" value={stats.totalPublishers} />
          <StatCard label="Admins" value={stats.totalAdmins} />
          <StatCard
            label="Blocked Users"
            value={stats.blockedUsers}
            tone={stats.blockedUsers > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Games
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Games" value={stats.totalGames} />
          <StatCard label="Published" value={stats.publishedGames} />
          <StatCard
            label="Blocked Games"
            value={stats.blockedGames}
            tone={stats.blockedGames > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Commerce
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Orders" value={stats.totalOrders} />
          <StatCard label="Paid Orders" value={stats.paidOrders} />
          <StatCard
            label="Gross Revenue"
            value={formatMoney(stats.grossRevenue)}
            tone="highlight"
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Community
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <StatCard label="Total Reviews" value={stats.totalReviews} />
          <StatCard
            label="Average Rating"
            value={`${stats.averageRating.toFixed(2)} / 5`}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "highlight" | "warning";
}) {
  const toneClass =
    tone === "highlight"
      ? "bg-blue-50 border-blue-200 text-blue-600"
      : tone === "warning"
        ? "bg-yellow-50 border-yellow-200 text-yellow-700"
        : "bg-white border-gray-200 text-gray-900";

  return (
    <div className={`rounded-lg border p-5 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
