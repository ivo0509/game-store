"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  setUserBlockedAction,
  setUserRoleAction,
} from "@/app/actions/adminActions";
import type { AdminUserRow, UserRole } from "@/services/adminService";

export default function UserRow({
  user,
  currentAdminId,
}: {
  user: AdminUserRow;
  currentAdminId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isSelf = user.id === currentAdminId;

  const onRoleChange = (role: UserRole) => {
    startTransition(async () => {
      const result = await setUserRoleAction(user.id, role);
      if (!result.success) {
        alert(result.message);
      } else {
        router.refresh();
      }
    });
  };

  const onToggleBlocked = () => {
    startTransition(async () => {
      const result = await setUserBlockedAction(user.id, !user.isBlocked);
      if (!result.success) {
        alert(result.message);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{user.name}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
      </td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          disabled={isPending || isSelf}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
        >
          <option value="user">user</option>
          <option value="publisher">publisher</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td className="px-4 py-3">
        {user.isBlocked ? (
          <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            blocked
          </span>
        ) : (
          <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            active
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        {user.gamesPublished}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        {user.ordersPlaced}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2 text-sm">
          {user.role === "user" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => onRoleChange("publisher")}
              className="font-medium text-blue-600 hover:underline disabled:opacity-50"
            >
              Promote
            </button>
          )}
          <button
            type="button"
            disabled={isPending || isSelf || user.role === "admin"}
            onClick={onToggleBlocked}
            className={`font-medium hover:underline disabled:opacity-50 ${
              user.isBlocked ? "text-green-600" : "text-red-600"
            }`}
          >
            {user.isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </td>
    </tr>
  );
}
