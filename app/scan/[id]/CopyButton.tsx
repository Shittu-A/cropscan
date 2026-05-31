'use client'

export default function CopyButton({ shareUrl }: { shareUrl: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(shareUrl)}
      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
    >
      Copy
    </button>
  )
}
