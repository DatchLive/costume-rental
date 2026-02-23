import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'
import { ContactFormClient } from './ContactFormClient'

export const metadata: Metadata = { title: 'お問い合わせ' }

export default function ContactPage() {
  return (
    <StaticPageLayout title="お問い合わせ">
      <p>
        ご質問・ご不明な点がございましたら、下記フォームよりお問い合わせください。
        通常2〜3営業日以内にご返答いたします。
      </p>
      <div className="mt-8">
        <ContactFormClient />
      </div>
    </StaticPageLayout>
  )
}
