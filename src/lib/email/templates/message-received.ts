interface MessageReceivedEmailProps {
  userName: string
  senderName: string
  costumeTitle: string
  messagePreview: string
  rentalLink: string
}

export function messageReceivedEmail({
  userName,
  senderName,
  costumeTitle,
  messagePreview,
  rentalLink,
}: MessageReceivedEmailProps): { subject: string; html: string } {
  return {
    subject: `【社交ダンス衣装レンタル】${senderName} 様からメッセージが届きました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b45309;">新しいメッセージが届きました</h2>
        <p>${userName} 様</p>
        <p>「${costumeTitle}」の取引で ${senderName} 様からメッセージが届きました。</p>
        <div style="background: #f9fafb; border-left: 4px solid #b45309; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; color: #374151; font-size: 14px;">${messagePreview}</p>
        </div>
        <a href="${rentalLink}" style="display: inline-block; background: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          メッセージを確認する
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
          このメールは社交ダンス衣装レンタルから自動送信されています。
        </p>
      </div>
    `,
  }
}
