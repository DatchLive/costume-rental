'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface StatusToggleClientProps {
  costumeId: string
  currentStatus: 'available' | 'hidden'
}

export function StatusToggleClient({ costumeId, currentStatus }: StatusToggleClientProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    const newStatus = currentStatus === 'available' ? 'hidden' : 'available'
    await supabase.from('costumes').update({ status: newStatus }).eq('id', costumeId)
    router.refresh()
    setLoading(false)
  }

  return (
    <Button variant="ghost" size="sm" loading={loading} onClick={toggle}>
      {currentStatus === 'available' ? '非公開にする' : '公開する'}
    </Button>
  )
}
