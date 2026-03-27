import Link from 'next/link'
import { ShirtIcon } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link href="/" className="flex items-center gap-2 text-amber-700">
              <ShirtIcon className="h-5 w-5" aria-hidden="true" />
              <span className="font-bold">社交ダンス衣装レンタル</span>
            </Link>
            <p className="text-xs text-gray-500">社交ダンス衣装のマッチングプラットフォーム</p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 sm:justify-end">
            <Link href="/guide" className="hover:text-amber-700">
              使い方ガイド
            </Link>
            <Link href="/terms" className="hover:text-amber-700">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-amber-700">
              プライバシーポリシー
            </Link>
            <Link href="/tokushoho" className="hover:text-amber-700">
              特定商取引法
            </Link>
            <Link href="/faq" className="hover:text-amber-700">
              よくある質問
            </Link>
            <Link href="/contact" className="hover:text-amber-700">
              お問い合わせ
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} 社交ダンス衣装レンタル. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
