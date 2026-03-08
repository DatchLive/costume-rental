import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { rentalId, targetUserId } = await request.json()
    if (!rentalId || !targetUserId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const link = `/messages/${rentalId}`

    // 未読の message_received 通知が既にあればスキップ（重複防止）
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('type', 'message_received')
      .eq('link', link)
      .eq('is_read', false)
      .limit(1)
      .single()

    if (!existing) {
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'message_received',
        title: '新しいメッセージが届きました',
        link,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Notifications API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
