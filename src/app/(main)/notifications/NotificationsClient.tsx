'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { NotificationItem } from '@/components/notification/NotificationItem'
import { Button } from '@/components/ui/Button'
import type { Notification } from '@/types/database'

interface NotificationsClientProps {
  userId: string
  initialNotifications: Notification[]
}

export function NotificationsClient({ userId, initialNotifications }: NotificationsClientProps) {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(userId)

  // Use realtime notifications if available, fallback to initial
  const displayNotifications = notifications.length > 0 ? notifications : initialNotifications

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            すべて既読にする（{unreadCount}件）
          </Button>
        </div>
      )}

      {displayNotifications.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <p>通知はありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  )
}
