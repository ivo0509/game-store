"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { setGameBlockedAction } from "@/app/actions/adminActions";

export default function GameBlockButton({
  gameId,
  blocked,
}: {
  gameId: number;
  blocked: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const result = await setGameBlockedAction(gameId, !blocked);
      if (!result.success) {
        alert(result.message);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onClick}
      className={`text-sm font-medium hover:underline disabled:opacity-50 ${
        blocked ? "text-green-600" : "text-red-600"
      }`}
    >
      {blocked ? "Unblock" : "Block"}
    </button>
  );
}
