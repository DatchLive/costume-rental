'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types/database'

export function useRealtimeMessages(rentalId: string, initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)

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
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rentalId])

  return messages
}
