"use client"

import { ContentLayout } from "@/components/admin-panel/content-layout"
import { Stats } from "./components/stats"
import { useState } from "react"
import type { Filter } from "@/components/ui/filters"
import { RiskFilter, FilterTypes, FilterOperators } from "@/components/filters/risk-filter"

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
          <div className="flex items-center justify-between">
            {/* <JsonViewer data={filters} initialExpandLevel={5} showCopyButton={true} /> */}
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}

