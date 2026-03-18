import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = { title: 'プライバシーポリシー' }

export default function PrivacyPage() {
  return (
    <StaticPageLayout title="プライバシーポリシー">
      <p>最終更新日: 2026年3月1日</p>

      <h2>1. 収集する情報</h2>
      <p>当社は、本サービスの提供のため、以下の情報を収集します。</p>
      <ul>
        <li>氏名・メールアドレス等の登録情報</li>
        <li>プロフィール情報（エリア、自己紹介など）</li>
        <li>取引履歴・メッセージ</li>
        <li>アップロードされた画像</li>
      </ul>

      <h2>2. 情報の利用目的</h2>
      <p>収集した情報は、以下の目的で利用します。</p>
      <ul>
        <li>本サービスの提供・運営</li>
        <li>ユーザーへの連絡・通知</li>
        <li>サービスの改善・新機能の開発</li>
        <li>不正行為の防止</li>
      </ul>

      <h2>3. 第三者への提供</h2>
      <p>当社は、法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。</p>

      <h2>4. セキュリティ</h2>
      <p>当社は、収集した情報の漏洩・紛失・改ざんを防ぐため、適切なセキュリティ対策を講じます。</p>

      <h2>5. お問い合わせ</h2>
      <p>プライバシーに関するお問い合わせは、お問い合わせページよりご連絡ください。</p>
    </StaticPageLayout>
  )
}
