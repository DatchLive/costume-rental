import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next';
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: {
    default: '社交ダンス衣装レンタル',
    template: '%s | 社交ダンス衣装レンタル',
  },
  description:
    '社交ダンスの衣装をユーザー同士で貸し借りできるマッチングプラットフォーム。ラテン・スタンダードの衣装をリーズナブルにレンタルできます。',
  openGraph: {
    siteName: '社交ダンス衣装レンタル',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans antialiased">{children}<Analytics /></body>
    </html>
  )
}
