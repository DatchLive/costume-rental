import type { Metadata } from 'next'
import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export const metadata: Metadata = { title: '特定商取引法に基づく表記' }

export default function TokushohoPage() {
  return (
    <StaticPageLayout title="特定商取引法に基づく表記">
      <table className="mt-4 w-full border-collapse text-sm">
        <tbody>
          {[
            ['サービス名', '社交ダンス衣装レンタル'],
            ['運営者', '本田 航平'],
            ['所在地', '請求があったら遅滞なく電子メール等で提供します。'],
            ['連絡先', 'お問い合わせページのフォームよりご連絡ください。'],
            ['販売価格', '各衣装の出品ページに記載の通り'],
            ['追加費用', '送料は出品者が設定します。詳細は各出品ページをご確認ください。'],
            ['支払方法', '現在は当事者間での取り決めによります'],
            ['引渡し時期', '出品者・借り手間で協議の上、決定されます'],
            [
              '返品・交換',
              'レンタル品のため、返品・交換は原則受け付けておりません。破損等のトラブルは当事者間で協議してください。',
            ],
            [
              'キャンセルポリシー',
              '使用日7日以上前：無料 / 使用日3〜6日前：30% / 使用日1〜2日前：50% / 使用日当日：100%。キャンセル料の授受は当事者間で行ってください。',
            ],
          ].map(([label, value]) => (
            <tr key={label} className="border-b border-gray-200">
              <td className="w-1/3 bg-gray-50 px-4 py-3 font-medium text-gray-700">{label}</td>
              <td className="px-4 py-3 text-gray-600">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </StaticPageLayout>
  )
}
