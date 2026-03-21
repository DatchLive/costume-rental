import { Avatar } from '@/components/ui/Avatar'
import { formatDateTime } from '@/lib/utils'
import type { Message, Profile } from '@/types/database'

interface MessageBubbleProps {
  message: Message
  sender: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  isOwn: boolean
}

export function MessageBubble({ message, sender, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <Avatar src={sender.avatar_url} name={sender.name} size="sm" className="shrink-0" />
      )}
      <div
        className={`max-w-xs sm:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}
      >
        {!isOwn && <span className="text-xs text-gray-500">{sender.name ?? '名前未設定'}</span>}
        <div
          className={`rounded-2xl px-4 py-2 text-sm ${
            isOwn
              ? 'rounded-br-sm bg-amber-700 text-white'
              : 'rounded-bl-sm border border-gray-200 bg-white text-gray-900'
          }`}
        >
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex items-center gap-2">
          {isOwn && (
            <span className={`text-xs ${message.is_read ? 'text-amber-600' : 'text-gray-300'}`}>
              {message.is_read ? '既読' : '未読'}
            </span>
          )}
          <span className="text-xs text-gray-400">{formatDateTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  )
}
