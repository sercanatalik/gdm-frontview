"use client"

import { useSearchParams } from "next/navigation"
import { useMemo, useEffect, useState } from "react"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import { DataTable } from "./data-table"
import { columns, Trade } from "./columns"

interface Filter {
  id: string
  type: string
  operator: string
  value: string[]
}

export default function TradesPage() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || ""
  const filtersParam = searchParams.get("filters") || "[]"
  const groupType = searchParams.get("groupType") || ""
  
  const [filters, setFilters] = useState<Filter[]>([])
  const [data, setData] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    try {
      const parsedFilters = JSON.parse(filtersParam)
      setFilters(parsedFilters)
    } catch (e) {
      console.error("Failed to parse filters:", e)
      setFilters([])
    }
  }, [filtersParam])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch("/api/financing/risk/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            filter: filters,
            orderBy: "tradeDate DESC"
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching trades:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters])

  const handleViewDetails = (row: Trade) => {
    // Navigate to the details page with the trade ID
    window.location.href = `/financing/trades/price?id=${encodeURIComponent(row.tradeId)}`
  }

  return (
    <ContentLayout title={`${name} Trades`}>
      <div className="w-full h-full flex flex-col">
        <DataTable 
          columns={columns} 
          data={data} 
          onViewDetails={handleViewDetails}
        />
      </div>
    </ContentLayout>
  )
}

