"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteReviewAction } from "@/app/actions/adminActions";

export default function ReviewDeleteButton({
  reviewId,
}: {
  reviewId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteReviewAction(reviewId);
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
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
