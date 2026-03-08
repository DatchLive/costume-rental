interface RentalCancelledEmailProps {
  userName: string
  cancellerName: string
  costumeTitle: string
  rentalLink: string
}

export function rentalCancelledEmail({
  userName,
  cancellerName,
  costumeTitle,
  rentalLink,
}: RentalCancelledEmailProps): { subject: string; html: string } {
  return {
    subject: `【社交ダンス衣装レンタル】取引がキャンセルされました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">取引がキャンセルされました</h2>
        <p>${userName} 様</p>
        <p>「${costumeTitle}」の取引が ${cancellerName} 様によりキャンセルされました。</p>
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
