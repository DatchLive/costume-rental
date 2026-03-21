'use client'

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MessageInputProps {
  rentalId: string
  senderId: string
  disabled?: boolean
}

export function MessageInput({ rentalId, senderId, disabled }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    setSending(true)
    const supabase = createClient()
    await supabase.from('messages').insert({
      rental_id: rentalId,
      sender_id: senderId,
      content: trimmed,
    })
    setContent('')
    setSending(false)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (disabled) {
    return (
      <div className="border-t border-gray-200 bg-white px-4 py-3 text-center text-sm text-gray-400">
        この取引のメッセージは締め切られました
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 border-t border-gray-200 bg-white p-4">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力（Enter で送信 / Shift+Enter で改行）"
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
  )
}
