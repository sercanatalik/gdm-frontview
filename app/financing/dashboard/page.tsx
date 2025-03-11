"use client"

import { ContentLayout } from "@/components/admin-panel/content-layout"
import { Stats } from "./components/stats"
import { useState } from "react"
import type { Filter } from "@/components/ui/filters"
import { RiskFilter, FilterTypes, FilterOperators } from "@/components/filters/risk-filter"
import { Overview } from "./components/Overview"
import { RecentTradesCard } from "./components/RecentTradeCard"
import { CounterpartySummary } from "./components/CounterpartySummary"
import { ExposureSummary } from "./components/ExposureSummary"
import { RevenueCard } from "./components/RevenueCard"
export default function FinancingMainPage() {
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filter[]>([])

  const handleDeskChange = (desk: string | null) => {
    setSelectedDesk(desk)

    setFilters((prev) => {
      const filteredFilters = prev.filter((f) => f.type !== FilterTypes.DESK)
      if (!desk) return filteredFilters

      return [
        ...filteredFilters,
        {
          id: Date.now().toString(),
          type: FilterTypes.DESK,
          operator: FilterOperators.IS,
          value: [desk],
        },
      ]
    })
  }

  return (
    <ContentLayout title="Dashboard">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 p-0">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Financing Frontview</h2>
            <RiskFilter filters={filters} setFilters={setFilters} />
          </div>
          
          <Stats onDeskChange={handleDeskChange} filters={filters} />
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Overview filters={filters} />
            </div>
            <div className="flex-1">
            <RecentTradesCard filters={filters} />
          
              
            </div>
         
          </div>
          <div className="flex flex-col md:flex-row gap-4">

          <div className="flex-1">
            <CounterpartySummary filters={filters} />
          
          </div>
          <div className="flex-1">
            <ExposureSummary filters={filters} />
          </div>
         
          </div>
          <RevenueCard  />

          {/* Uncomment for debugging */}
          {/* <JsonViewer data={filters} initialExpandLevel={5} showCopyButton={true} /> */}
        </div>
      </div>
    </ContentLayout>
  )
}

