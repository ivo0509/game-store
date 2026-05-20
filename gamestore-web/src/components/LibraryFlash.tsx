"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LibraryFlash({ message }: { message: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Strip the query param from the URL so a refresh doesn't re-show the message.
    router.replace("/library");
    const timeout = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timeout);
  }, [router]);

  if (!visible) return null;

  return (
    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      {message}
    </div>
  );
}
