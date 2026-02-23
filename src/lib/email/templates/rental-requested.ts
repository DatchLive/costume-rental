interface RentalRequestedEmailProps {
  ownerName: string
  renterName: string
  costumeTitle: string
  startDate: string
  endDate: string
  totalPrice: number
  rentalLink: string
}

export function rentalRequestedEmail({
  ownerName,
  renterName,
  costumeTitle,
  startDate,
  endDate,
  totalPrice,
  rentalLink,
}: RentalRequestedEmailProps): { subject: string; html: string } {
  return {
    subject: `【社交ダンス衣装レンタル】${renterName}様からレンタル申請が届きました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #92400e;">レンタル申請が届きました</h2>
        <p>${ownerName} 様</p>
        <p>${renterName} 様から「${costumeTitle}」へのレンタル申請が届きました。</p>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb; width: 40%;">レンタル期間</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${startDate} 〜 ${endDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;">合計金額</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">¥${totalPrice.toLocaleString('ja-JP')}</td>
          </tr>
        </table>
        <p>下記のリンクから申請を承認または却下してください。</p>
        <a href="${rentalLink}" style="display: inline-block; background: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          申請を確認する
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
          このメールは社交ダンス衣装レンタルから自動送信されています。
        </p>
      </div>
    `,
  }
}
