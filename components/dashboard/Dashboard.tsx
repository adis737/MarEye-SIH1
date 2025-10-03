'use client'

import { useState } from 'react'
import LiveMissionTab from './tabs/LiveMissionTab'
import AnalyticsTab from './tabs/AnalyticsTab'
import SystemHealthTab from './tabs/SystemHealthTab'

type TabKey = 'live' | 'analytics' | 'health'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'live', label: 'Live Mission' },
  { key: 'analytics', label: 'Mission Analytics' },
  { key: 'health', label: 'System Health' },
]

export default function Dashboard() {
  const [active, setActive] = useState<TabKey>('live')

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === t.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {active === 'live' && <LiveMissionTab />}
        {active === 'analytics' && <AnalyticsTab />}
        {active === 'health' && <SystemHealthTab />}
      </div>
    </div>
  )
}


