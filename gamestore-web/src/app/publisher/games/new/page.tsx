import Link from "next/link";

import GameForm from "@/components/publisher/GameForm";

export default function NewGamePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/publisher/games"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
      >
        ← Back to My Games
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Game</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <GameForm mode="create" />
      </div>
    </div>
  );
}
