interface ReturnReminderEmailProps {
  renterName: string
  costumeTitle: string
  endDate: string
  rentalLink: string
  isToday: boolean
}

export function returnReminderEmail({
  renterName,
  costumeTitle,
  endDate,
  rentalLink,
  isToday,
}: ReturnReminderEmailProps): { subject: string; html: string } {
  const timing = isToday ? '本日' : '明日'
  return {
    subject: `【社交ダンス衣装レンタル】${timing}が「${costumeTitle}」の返却期限です`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">返却期限のお知らせ</h2>
        <p>${renterName} 様</p>
        <p>レンタル中の「${costumeTitle}」の返却期限が<strong>${timing}（${endDate}）</strong>です。</p>
        <p>期限内にご返却いただきますようお願いいたします。</p>
        <a href="${rentalLink}" style="display: inline-block; background: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          取引詳細を確認する
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
          このメールは社交ダンス衣装レンタルから自動送信されています。
        </p>
      </div>
    `,
  }
}
