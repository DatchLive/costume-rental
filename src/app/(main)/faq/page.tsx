import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = { title: 'よくある質問' }

const faqs = [
  {
    q: 'レンタル期間はどのくらいですか？',
    a: '出品者によって異なります。',
  },
  {
    q: '送料はどうなりますか？',
    a: '送料の扱いは出品者によって異なります。全国発送対応の場合は出品ページに記載があります。詳細はメッセージで出品者にご確認ください。',
  },
  {
    q: '衣装が破損していた場合はどうすればいいですか？',
    a: 'まず出品者にメッセージでご連絡ください。当事者間で解決できない場合は、運営にお問い合わせください。サービス内の取引記録をもとに仲裁します。',
  },
  {
    q: 'キャンセルはできますか？',
    a: 'キャンセルはレンタル開始日の前であれば可能です。開始日までの日数によってキャンセル料が発生する場合があります。詳細は利用規約をご確認ください。',
  },
  {
    q: '出品できる衣装に制限はありますか？',
    a: '社交ダンス（ラテン・スタンダード）に関連する衣装・アクセサリーのみ出品可能です。現在最大3点までです。',
  },
  {
    q: 'Google アカウントでログインできますか？',
    a: 'はい、Google アカウントでのログインに対応しています。メールアドレスとパスワードでの登録も可能です。',
  },
  {
    q: '評価はいつ公開されますか？',
    a: '取引の双方が評価を投稿した時点、または最初の評価投稿から7日後のどちらか早いタイミングで公開されます。先出し不利を防ぐための仕組みです。',
  },
]

export default function FaqPage() {
  return (
    <StaticPageLayout title="よくある質問">
      <div className="flex flex-col gap-4">
        {faqs.map(({ q, a }) => (
          <details key={q} className="group rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer list-none font-medium text-gray-900 group-open:text-amber-700">
              <span className="mr-2 text-amber-600">Q.</span>
              {q}
            </summary>
            <p className="mt-3 text-sm text-gray-600">
              <span className="mr-2 font-medium text-gray-700">A.</span>
              {a}
            </p>
          </details>
        ))}
      </div>
    </StaticPageLayout>
  )
}
