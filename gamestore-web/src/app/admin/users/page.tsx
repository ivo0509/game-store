import UserRow from "@/components/admin/UserRow";
import { requireAdmin } from "@/lib/auth";
import { listAllUsers } from "@/services/adminService";

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const users = await listAllUsers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Users</h1>
      <p className="text-gray-600 mb-6">{users.length} total</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Games</th>
              <th className="px-4 py-3 font-medium text-right">Orders</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} currentAdminId={session.userId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
