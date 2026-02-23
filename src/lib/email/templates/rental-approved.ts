interface RentalApprovedEmailProps {
  renterName: string
  ownerName: string
  costumeTitle: string
  startDate: string
  endDate: string
  totalPrice: number
  rentalLink: string
}

export function rentalApprovedEmail({
  renterName,
  ownerName,
  costumeTitle,
  startDate,
  endDate,
  totalPrice,
  rentalLink,
}: RentalApprovedEmailProps): { subject: string; html: string } {
  return {
    subject: `【社交ダンス衣装レンタル】レンタル申請が承認されました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">レンタル申請が承認されました</h2>
        <p>${renterName} 様</p>
        <p>「${costumeTitle}」のレンタル申請が ${ownerName} 様に承認されました。</p>
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
        <p>出品者に連絡を取り、発送方法等を確認してください。</p>
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
