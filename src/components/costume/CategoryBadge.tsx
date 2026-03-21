import { Badge } from '@/components/ui/Badge'

const categoryColors: Record<string, string> = {
  'ラテン（女性）': 'bg-pink-100 text-pink-800',
  'ラテン（男性）': 'bg-blue-100 text-blue-800',
  'スタンダード（女性）': 'bg-purple-100 text-purple-800',
  'スタンダード（男性）': 'bg-indigo-100 text-indigo-800',
  練習着: 'bg-green-100 text-green-800',
  'アクセサリー・小物': 'bg-amber-100 text-amber-800',
  その他: 'bg-gray-100 text-gray-800',
}

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <Badge
      className={`${categoryColors[category] ?? 'bg-gray-100 text-gray-800'} ${className ?? ''}`}
    >
      {category}
    </Badge>
  )
}
