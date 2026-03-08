interface RentalReturnedEmailProps {
  userName: string
  costumeTitle: string
  rentalLink: string
}

export function rentalReturnedEmail({
  userName,
  costumeTitle,
  rentalLink,
}: RentalReturnedEmailProps): { subject: string; html: string } {
  return {
    subject: `【社交ダンス衣装レンタル】返却が完了しました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">返却が完了しました</h2>
        <p>${userName} 様</p>
        <p>「${costumeTitle}」の返却が完了しました。</p>
        <p>取引ページから評価を投稿してください。</p>
        <a href="${rentalLink}" style="display: inline-block; background: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          評価を投稿する
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
          このメールは社交ダンス衣装レンタルから自動送信されています。
        </p>
      </div>
    `,
  }
}
