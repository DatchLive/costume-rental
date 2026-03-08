interface RentalActiveEmailProps {
  renterName: string
  costumeTitle: string
  rentalLink: string
}

export function rentalActiveEmail({
  renterName,
  costumeTitle,
  rentalLink,
}: RentalActiveEmailProps): { subject: string; html: string } {
  return {
    subject: `【社交ダンス衣装レンタル】衣装が発送されました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b45309;">衣装が発送されました</h2>
        <p>${renterName} 様</p>
        <p>「${costumeTitle}」が発送されました。到着をお待ちください。</p>
        <p>受け取り方法・住所などの詳細はメッセージをご確認ください。</p>
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
