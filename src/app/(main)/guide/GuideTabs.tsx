'use client'

import { useState } from 'react'

type Tab = 'renter' | 'owner'

interface GuideTabsProps {
  renterContent: React.ReactNode
  ownerContent: React.ReactNode
}

export function GuideTabs({ renterContent, ownerContent }: GuideTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('renter')

  return (
    <div>
      <div className="mb-8 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => setActiveTab('renter')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'renter'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          借りる
        </button>
        <button
          onClick={() => setActiveTab('owner')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'owner'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          貸す
        </button>
      </div>

      <div className="[&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_p.lead]:mb-6 [&_p.lead]:text-sm [&_p.lead]:text-gray-500">
        {activeTab === 'renter' ? renterContent : ownerContent}
      </div>
    </div>
  )
}
