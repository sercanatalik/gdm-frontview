"use client"

import { RiskFilter } from "@/components/filters/risk-filter"
import type { Filter } from "@/components/ui/filters"
import { useState, useEffect } from "react"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import { JsonViewer } from "@/components/json-viewer"

export default function FinancingWorkspace() {
  const [filters, setFilters] = useState<Filter[]>([])
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const response = await fetch("/api/financing/risk/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filter: filters }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch risk data")
        }

        const data = await response.json()
        setResults(data)
        // Handle the response data as needed
      } catch (error) {
        console.error("Error fetching risk data:", error)
      }
    }

    if (filters.length > 0) {
      fetchRiskData()
    }
  }, [filters])

  return (
    <ContentLayout title="Workspace">
      <div className="flex-1 space-y-4 p-0 pt-0">
        <div className="flex justify-end">
          <RiskFilter filters={filters} setFilters={setFilters} tableName="risk_f_mv" />
        </div>
        <div className="flex mx-4">
          <JsonViewer data={filters} initialExpandLevel={5} showCopyButton={true}></JsonViewer>
          <JsonViewer
            data={Array.isArray(results) ? results.slice(0, 10) : results}
            initialExpandLevel={5}
            showCopyButton={true}
          ></JsonViewer>
        </div>
      </div>
    </ContentLayout>
  )
}

