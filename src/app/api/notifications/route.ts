import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { messageReceivedEmail } from '@/lib/email/templates/message-received'

export async function POST(request: Request) {
  try {
    const { rentalId, targetUserId, senderName, messagePreview } = await request.json()
    if (!rentalId || !targetUserId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
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
      // 衣装タイトルを取得
      const { data: rental } = await supabase
        .from('rentals')
        .select('costumes(title)')
        .eq('id', rentalId)
        .single()
      const costumeTitle =
        (rental as unknown as { costumes: { title: string } | null })?.costumes?.title ?? '衣装'

      await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'message_received',
        title: '新しいメッセージが届きました',
        body: costumeTitle,
        link,
      })

      // メール送信
      try {
        const { data: targetAuth } = await supabase.auth.admin.getUserById(targetUserId)
        const targetEmail = targetAuth.user?.email

        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', targetUserId)
          .single()

        if (targetEmail) {
          const { subject, html } = messageReceivedEmail({
            userName: targetProfile?.name ?? '利用者',
            senderName: senderName ?? '相手',
            costumeTitle,
            messagePreview: messagePreview ?? '',
            rentalLink: `${appUrl}${link}`,
          })
          await sendEmail({ to: targetEmail, subject, html })
        }
      } catch (emailError) {
        console.error('[Message email error (non-fatal)]', emailError)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Notifications API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
