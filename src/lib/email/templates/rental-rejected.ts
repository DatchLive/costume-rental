interface RentalRejectedEmailProps {
  renterName: string
  costumeTitle: string
  reason?: string
}

export function rentalRejectedEmail({
  renterName,
  costumeTitle,
  reason,
}: RentalRejectedEmailProps): { subject: string; html: string } {
  return {
    subject: `【社交ダンス衣装レンタル】レンタル申請が却下されました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">レンタル申請が却下されました</h2>
        <p>${renterName} 様</p>
        <p>「${costumeTitle}」のレンタル申請が却下されました。</p>
        ${reason ? `<p>理由：${reason}</p>` : ''}
        <p>他の衣装もご覧ください。</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          衣装を探す
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
          このメールは社交ダンス衣装レンタルから自動送信されています。
        </p>
      </div>
    `,
  }
}
