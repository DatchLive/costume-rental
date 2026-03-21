'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import type { Message, Profile } from '@/types/database'

interface MessagePanelProps {
  rentalId: string
  currentUserId: string
  currentUserName: string
  otherUserId: string
  initialMessages: Message[]
  participants: Record<string, Pick<Profile, 'id' | 'name' | 'avatar_url'>>
  inputDisabled?: boolean
}

export function MessagePanel({
  rentalId,
  currentUserId,
  currentUserName,
  otherUserId,
  initialMessages,
  participants,
  inputDisabled,
}: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  // tempId -> content のマップ。Realtime で届いたら差し替えるために使う
  const pendingMap = useRef<Map<string, string>>(new Map())
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 新しいメッセージが追加されたら末尾にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime 購読
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`rental-messages:${rentalId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `rental_id=eq.${rentalId}`,
        },
        (payload) => {
          const incoming = payload.new as Message

          if (incoming.sender_id === currentUserId) {
            // 自分が送ったメッセージ: 楽観的に追加した temp メッセージと差し替える
            const [tempId] =
              [...pendingMap.current.entries()].find(([, c]) => c === incoming.content) ?? []

            if (tempId) {
              pendingMap.current.delete(tempId)
              setMessages((prev) => prev.map((m) => (m.id === tempId ? incoming : m)))
              return
            }
          }

          // 相手のメッセージ: 画面を見ているのですぐ既読にする
          if (incoming.sender_id !== currentUserId) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', incoming.id)
              .then(() => {})
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev
            return [
              ...prev,
              {
                ...incoming,
                is_read: incoming.sender_id !== currentUserId ? true : incoming.is_read,
              },
            ]
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `rental_id=eq.${rentalId}`,
        },
        (payload) => {
          const updated = payload.new as Message
          // 自分が送ったメッセージの既読状態を更新
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, is_read: updated.is_read } : m)),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rentalId, currentUserId])

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    // 楽観的更新: 即座に画面に追加
    const tempId = `temp-${Date.now()}-${Math.random()}`
    const tempMsg: Message = {
      id: tempId,
      rental_id: rentalId,
      sender_id: currentUserId,
      content: trimmed,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    pendingMap.current.set(tempId, trimmed)
    setMessages((prev) => [...prev, tempMsg])
    setContent('')

    setSending(true)
    const supabase = createClient()
    const { error } = await supabase.from('messages').insert({
      rental_id: rentalId,
      sender_id: currentUserId,
      content: trimmed,
    })

    if (error) {
      // 送信失敗時は楽観的追加を取り消す
      pendingMap.current.delete(tempId)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setContent(trimmed)
    } else {
      // 相手への message_received 通知・メール（未読の同通知がなければ保存）
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalId,
          targetUserId: otherUserId,
          senderName: currentUserName,
          messagePreview: trimmed.slice(0, 100),
        }),
      })
    }

    setSending(false)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
        <div className="flex flex-col gap-4 p-4">
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
      </div>

      {/* 入力欄 */}
      {inputDisabled ? (
        <div className="border-t border-gray-200 bg-white px-4 py-3 text-center text-sm text-gray-400">
          この取引のメッセージは締め切られました
        </div>
      ) : (
        <div className="flex items-end gap-2 border-t border-gray-200 bg-white p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力（Shift+Enter で送信 / Enter で改行）"
            rows={2}
            maxLength={1000}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="rounded-xl bg-amber-700 p-3 text-white transition-colors hover:bg-amber-800 disabled:opacity-50"
            aria-label="送信"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}
