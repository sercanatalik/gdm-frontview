"use client"

import { ContentLayout } from "@/components/admin-panel/content-layout"
import { Stats } from "./components/stats"
import { useStore } from "@tanstack/react-store"
import { store, setSelectedDesk, setFilters } from "@/app/store"
import type { Filter } from "@/components/ui/filters"
import { RiskFilter } from "@/components/filters/risk-filter"
import { Overview } from "./components/Overview"
import { RecentTradesCard } from "./components/RecentTradeCard"
import { ExposureSummary } from "./components/ExposureSummary"
import { PieSummary } from "./components/PieSummary"
import { RevenueCard } from "./components/RevenueCard"
import { MaturityTimeline } from "./components/MaturityTimeline"

export default function FinancingMainPage() {
  const { filters } = useStore(store)

  return (
    <ContentLayout title="Dashboard">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 p-0">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Financing Frontview</h2>
            <RiskFilter filters={filters} setFilters={setFilters} />
          </div>
          
          <Stats onDeskChange={setSelectedDesk} filters={filters} />
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Overview filters={filters} />
            </div>
            <div className="flex-2">
            <RecentTradesCard filters={filters} />
          
              
            </div>
         
          </div>
          <div className="flex flex-col md:flex-row gap-4">

          <div className="flex-1">
            <ExposureSummary filters={filters} groupBy="SL1" countBy="counterparty" orderBy="totalCashOut DESC" title="Top Instruments" viewAllText="View all instruments" />
          
          </div>
          <div className="flex-1">
            <ExposureSummary filters={filters} groupBy="counterparty" countBy="instrument" orderBy="totalCashOut DESC" title="Top Counterparties" viewAllText="View all counterparties" />
          </div>
          <div className="flex-1">
            <ExposureSummary filters={filters} groupBy="vcProduct" countBy="tradeCcy" orderBy="totalCashOut DESC" title="Top Products" viewAllText="View all products" />
          </div>

          <div className="flex-1">
            <PieSummary filters={filters} groupBy="SL1" countBy="counterparty" orderBy="totalCashOut DESC" title="By Collaboration" viewAllText="View all instruments" />
          
          </div>
         
          </div>

          <div className="flex flex-col md:flex-row gap-4">


          <div className="flex-1">
          <RevenueCard  />
          </div>

          <div className="flex-1">
          <MaturityTimeline filters={filters} />
          </div>  

          </div>
        </div>
      </div>
    </ContentLayout>
  )
}

