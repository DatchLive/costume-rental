import Link from 'next/link'
import { Bell, ShirtIcon, MessageSquare, Star, RotateCcw } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types/database'

const icons: Record<string, React.ReactNode> = {
  rental_requested: <ShirtIcon className="h-4 w-4 text-amber-600" />,
  rental_approved: <ShirtIcon className="h-4 w-4 text-green-600" />,
  rental_rejected: <ShirtIcon className="h-4 w-4 text-red-600" />,
  message_received: <MessageSquare className="h-4 w-4 text-blue-600" />,
  rental_returned: <RotateCcw className="h-4 w-4 text-gray-600" />,
  review_received: <Star className="h-4 w-4 text-amber-500" />,
  return_reminder: <Bell className="h-4 w-4 text-orange-600" />,
}

interface NotificationItemProps {
  notification: Notification
  onRead?: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const content = (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        notification.is_read ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="mt-0.5 shrink-0">{icons[notification.type] ?? <Bell className="h-4 w-4" />}</div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${notification.is_read ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-xs text-gray-500">{notification.body}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-label="未読" />
      )}
    </div>
  )

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={() => onRead?.(notification.id)}
        className="block"
      >
        {content}
      </Link>
    )
  }

  return <div onClick={() => onRead?.(notification.id)}>{content}</div>
}
