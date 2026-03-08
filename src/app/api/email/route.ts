import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { rentalRequestedEmail } from '@/lib/email/templates/rental-requested'
import { rentalApprovedEmail } from '@/lib/email/templates/rental-approved'
import { rentalRejectedEmail } from '@/lib/email/templates/rental-rejected'
import { rentalActiveEmail } from '@/lib/email/templates/rental-active'
import { rentalReturningEmail } from '@/lib/email/templates/rental-returning'
import { rentalReturnedEmail } from '@/lib/email/templates/rental-returned'
import { rentalCancelledEmail } from '@/lib/email/templates/rental-cancelled'
import { formatDate } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, rentalId } = body

    if (type === 'contact') {
      const { name, email, subject, message } = body
      await sendEmail({
        to: process.env.RESEND_FROM_EMAIL ?? 'admin@example.com',
        subject: `[お問い合わせ] ${subject}`,
        html: `
          <p>お名前: ${name}</p>
          <p>メール: ${email}</p>
          <p>件名: ${subject}</p>
          <p>内容:</p>
          <pre>${message}</pre>
        `,
      })
      return NextResponse.json({ ok: true })
    }

    if (!rentalId) {
      return NextResponse.json({ error: 'Missing rentalId' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: rental } = await supabase
      .from('rentals')
      .select(`
        *,
        costumes(title),
        renter:profiles!rentals_renter_id_fkey(name),
        owner:profiles!rentals_owner_id_fkey(name)
      `)
      .eq('id', rentalId)
      .single()

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
    }

    const costume = (rental as unknown as { costumes: { title: string } }).costumes
    const renter = (rental as unknown as { renter: { name: string | null } }).renter
    const owner = (rental as unknown as { owner: { name: string | null } }).owner

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const rentalLink = `${appUrl}/rentals/${rentalId}`

    // ── アプリ内通知（必ず保存） ────────────────────────────────
    const notificationMap: Record<string, { user_id: string; type: string; title: string }[]> = {
      rental_requested: [{
        user_id: rental.owner_id,
        type: 'rental_requested',
        title: `${renter.name ?? '借り手'}様からレンタル申請が届きました`,
      }],
      rental_approved: [{
        user_id: rental.renter_id,
        type: 'rental_approved',
        title: 'レンタル申請が承認されました',
      }],
      rental_rejected: [{
        user_id: rental.renter_id,
        type: 'rental_rejected',
        title: 'レンタル申請が却下されました',
      }],
      rental_active: [{
        user_id: rental.renter_id,
        type: 'rental_approved',
        title: '衣装が発送されました',
      }],
      rental_returning: [{
        user_id: rental.owner_id,
        type: 'rental_returned',
        title: '借り手が返却しました',
      }],
      rental_returned: [
        {
          user_id: rental.renter_id,
          type: 'rental_returned',
          title: '返却が確認されました。評価を投稿してください',
        },
        {
          user_id: rental.owner_id,
          type: 'rental_returned',
          title: '返却が完了しました。評価を投稿してください',
        },
      ],
    }

    const targets = notificationMap[type]
    if (targets) {
      for (const t of targets) {
        await supabase.from('notifications').insert({
          ...t,
          body: costume.title,
          link: rentalLink,
        })
      }
    }

    // キャンセル通知（cancelled_by で通知先を決定）
    if (type === 'rental_cancelled') {
      const { cancelled_by } = body as { cancelled_by?: string }
      const notifyUserId = cancelled_by === 'renter' ? rental.owner_id : rental.renter_id
      const cancellerName = cancelled_by === 'renter'
        ? (renter.name ?? '借り手')
        : (owner.name ?? '出品者')
      await supabase.from('notifications').insert({
        user_id: notifyUserId,
        type: 'rental_rejected',
        title: `${cancellerName}様がキャンセルしました`,
        body: costume.title,
        link: rentalLink,
      })
    }

    // ── メール送信（Resend 未設定時・auth.admin 失敗時はスキップ） ──
    try {
      const { data: renterAuth } = await supabase.auth.admin.getUserById(rental.renter_id)
      const { data: ownerAuth } = await supabase.auth.admin.getUserById(rental.owner_id)

      const renterEmail = renterAuth.user?.email
      const ownerEmail = ownerAuth.user?.email
      const useDate = formatDate(rental.use_date)

      if (type === 'rental_requested' && ownerEmail) {
        const { subject, html } = rentalRequestedEmail({
          ownerName: owner.name ?? '出品者',
          renterName: renter.name ?? '借り手',
          costumeTitle: costume.title,
          useDate,
          totalPrice: rental.total_price,
          rentalLink,
        })
        await sendEmail({ to: ownerEmail, subject, html })
      }

      if (type === 'rental_approved' && renterEmail) {
        const { subject, html } = rentalApprovedEmail({
          renterName: renter.name ?? '借り手',
          ownerName: owner.name ?? '出品者',
          costumeTitle: costume.title,
          useDate,
          totalPrice: rental.total_price,
          rentalLink,
        })
        await sendEmail({ to: renterEmail, subject, html })
      }

      if (type === 'rental_rejected' && renterEmail) {
        const { subject, html } = rentalRejectedEmail({
          renterName: renter.name ?? '借り手',
          costumeTitle: costume.title,
        })
        await sendEmail({ to: renterEmail, subject, html })
      }

      if (type === 'rental_active' && renterEmail) {
        const { subject, html } = rentalActiveEmail({
          renterName: renter.name ?? '借り手',
          costumeTitle: costume.title,
          rentalLink,
        })
        await sendEmail({ to: renterEmail, subject, html })
      }

      if (type === 'rental_returning' && ownerEmail) {
        const { subject, html } = rentalReturningEmail({
          ownerName: owner.name ?? '出品者',
          costumeTitle: costume.title,
          rentalLink,
        })
        await sendEmail({ to: ownerEmail, subject, html })
      }

      if (type === 'rental_returned') {
        if (renterEmail) {
          const { subject, html } = rentalReturnedEmail({
            userName: renter.name ?? '借り手',
            costumeTitle: costume.title,
            rentalLink,
          })
          await sendEmail({ to: renterEmail, subject, html })
        }
        if (ownerEmail) {
          const { subject, html } = rentalReturnedEmail({
            userName: owner.name ?? '出品者',
            costumeTitle: costume.title,
            rentalLink,
          })
          await sendEmail({ to: ownerEmail, subject, html })
        }
      }

      if (type === 'rental_cancelled') {
        const { cancelled_by } = body as { cancelled_by?: string }
        const notifyEmail = cancelled_by === 'renter' ? ownerEmail : renterEmail
        const notifyName = cancelled_by === 'renter' ? (owner.name ?? '出品者') : (renter.name ?? '借り手')
        const cancellerName = cancelled_by === 'renter' ? (renter.name ?? '借り手') : (owner.name ?? '出品者')
        if (notifyEmail) {
          const { subject, html } = rentalCancelledEmail({
            userName: notifyName,
            cancellerName,
            costumeTitle: costume.title,
            rentalLink,
          })
          await sendEmail({ to: notifyEmail, subject, html })
        }
      }
    } catch (emailError) {
      console.error('[Email send error (non-fatal)]', emailError)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Email API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
