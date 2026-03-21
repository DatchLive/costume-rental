import { CostumeCard } from './CostumeCard'
import type { CostumeWithProfile } from '@/types/database'

interface CostumeGridProps {
  costumes: CostumeWithProfile[]
  emptyMessage?: string
  favoritedIds?: Set<string>
  userId?: string | null
}

export function CostumeGrid({
  costumes,
  emptyMessage = '衣装が見つかりませんでした',
  favoritedIds,
  userId,
}: CostumeGridProps) {
  if (costumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <svg
          className="mb-4 h-16 w-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {costumes.map((costume) => (
        <CostumeCard
          key={costume.id}
          costume={costume}
          isFavorited={favoritedIds?.has(costume.id) ?? false}
          userId={userId}
        />
      ))}
    </div>
  )
}
