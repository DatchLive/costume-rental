import type { Metadata } from 'next'
import { GuideTabs } from './GuideTabs'
import RenterGuide from '@/content/guide-renter.mdx'
import OwnerGuide from '@/content/guide-owner.mdx'

export const metadata: Metadata = {
  title: '使い方ガイド',
  description: '社交ダンス衣装レンタルの使い方を説明します。衣装を借りる方・貸す方それぞれの手順をご確認ください。',
}

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">使い方ガイド</h1>
      <p className="mb-8 text-sm text-gray-500">
        借りたい方・貸したい方それぞれの手順を説明します。
      </p>
      <GuideTabs
        renterContent={<RenterGuide />}
        ownerContent={<OwnerGuide />}
      />
    </div>
  )
}
