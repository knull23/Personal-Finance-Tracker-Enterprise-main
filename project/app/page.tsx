'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Overview } from '@/components/sections/overview'
import { Transactions } from '@/components/sections/transactions'
import { Analytics } from '@/components/sections/analytics'
import { Budget } from '@/components/sections/budget'
import { useFinanceData } from '@/lib/hooks/useFinanceData'

export default function Home() {
  const [activeSection, setActiveSection] = useState('overview')
  const financeData = useFinanceData()

  const isLoading =
    !financeData ||
    !Array.isArray(financeData.transactions) ||
    !Array.isArray(financeData.budgets)

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-gray-500 text-center mt-12">
          Loading your data...
        </div>
      )
    }

    switch (activeSection) {
      case 'overview':
        return <Overview {...financeData} />
      case 'transactions':
        return <Transactions {...financeData} />
      case 'analytics':
        return <Analytics {...financeData} />
      case 'budget':
        return <Budget {...financeData} />
      default:
        return <Overview {...financeData} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-semibold capitalize">
              {activeSection}
            </h1>
            <p className="text-sm text-gray-500">
              Manage your {activeSection} data below.
            </p>
          </header>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
