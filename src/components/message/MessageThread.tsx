'use client'

import { useEffect, useRef } from 'react'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { MessageBubble } from './MessageBubble'
import type { Message, Profile } from '@/types/database'

interface MessageThreadProps {
  rentalId: string
  currentUserId: string
  initialMessages: Message[]
  participants: Record<string, Pick<Profile, 'id' | 'name' | 'avatar_url'>>
}

export function MessageThread({
  rentalId,
  currentUserId,
  initialMessages,
  participants,
}: MessageThreadProps) {
  const messages = useRealtimeMessages(rentalId, initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {messages.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          まだメッセージはありません。最初のメッセージを送ってみましょう。
        </p>
      )}
      {messages.map((message) => {
        const sender = participants[message.sender_id] ?? {
          id: message.sender_id,
          name: null,
          avatar_url: null,
        }
        return (
          <MessageBubble
            key={message.id}
            message={message}
            sender={sender}
            isOwn={message.sender_id === currentUserId}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
