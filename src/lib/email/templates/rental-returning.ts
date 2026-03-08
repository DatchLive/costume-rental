interface RentalReturningEmailProps {
  ownerName: string
  costumeTitle: string
  rentalLink: string
}

export function rentalReturningEmail({
  ownerName,
  costumeTitle,
  rentalLink,
}: RentalReturningEmailProps): { subject: string; html: string } {
  return {
    subject: `【社交ダンス衣装レンタル】借り手が返却しました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b45309;">借り手が返却しました</h2>
        <p>${ownerName} 様</p>
        <p>「${costumeTitle}」の返却が報告されました。</p>
        <p>衣装を受け取ったら、取引ページから受取確認をしてください。</p>
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
