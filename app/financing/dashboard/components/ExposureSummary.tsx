"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Building2, ChevronRight } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, AlertCircle, Filter as FilterIcon } from "lucide-react"

interface GroupBySummary {
  groupBy: string
  totalCashOut: number
  totalNotional: number
  distinctCount: number
  change: number // Percentage change
}

interface ExposureSummaryProps {
  filters: Filter[]
  groupBy?: string
  countBy?: string
  orderBy?: string
  title?: string
  viewAllText?: string
  ignoreFilter?: string
}

// Function to get initials from counterparty name
function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

// Component for loading state
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

// Component for error state
function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-destructive">
      <AlertCircle className="h-8 w-8 mr-2" />
      <span>{error}</span>
    </div>
  )
}

// Component for empty state
function EmptyState() {
  return (
    <div className="flex items-center justify-center h-32 text-muted-foreground">
      <FilterIcon className="h-8 w-8 mr-2" />
      <span>No data available</span>
    </div>
  )
}

// Component for summary item
function SummaryItem({ 
  summary, 
  groupBy, 
  countBy, 
  filters 
}: { 
  summary: GroupBySummary, 
  groupBy: string, 
  countBy: string, 
  filters: Filter[] 
}) {
  return (
    <Link
      href={`/financing/details?groupType=${groupBy}&name=${encodeURIComponent(summary.groupBy)}&filters=${encodeURIComponent(JSON.stringify(filters))}`}
      className="block"
    >
      <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(summary.groupBy)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{summary.groupBy}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                {summary.distinctCount} {countBy}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium leading-none">
            ${(summary.totalCashOut / 1000000).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} M
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ${(summary.totalNotional / 1000000).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })} M notional
          </p>
        </div>
      </div>
    </Link>
  )
}

export function ExposureSummary({ 
  filters, 
  groupBy = 'SL1', 
  countBy = 'counterparty', 
  orderBy = 'totalCashOut DESC',
  title = 'Top Instruments',
  viewAllText = 'View all counterparties',
  ignoreFilter = ''
}: ExposureSummaryProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [summaries, setSummaries] = useState<GroupBySummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Filter out elements where type matches ignoreFilter
  const filteredFilters = filters.filter(filter => filter.type !== ignoreFilter)
  // Fetch data from API based on filters
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const fetchData = () => {
      setIsLoading(true)
      setError(null)

      // Fetch data from API using POST
      fetch('/api/financing/risk/groupby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filter: filteredFilters, groupBy, countBy, orderBy }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        setSummaries(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
        setIsLoading(false)
      })
    }

    // Initial fetch
    fetchData()
    
    // Set up interval for periodic fetching (every 30 seconds)
    intervalRef.current = setInterval(fetchData, 30000)
    
    // Cleanup interval on component unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [filters, groupBy, countBy, orderBy])

  return (
    <Card className="h-full w-full overflow-hidden rounded-lg flex flex-col">
      <CardHeader>
        <CardTitle>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <ScrollArea className="h-[400px]">
          <div className="p-4">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} />
            ) : summaries.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {summaries.slice(0, 7).map((summary) => (
                  <SummaryItem 
                    key={summary.groupBy} 
                    summary={summary} 
                    groupBy={groupBy} 
                    countBy={countBy} 
                    filters={filteredFilters} 
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      {!isLoading && (
        <div className="p-3 bg-muted/10 mt-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex items-center justify-center text-xs text-muted-foreground hover:text-primary"
          >
            {viewAllText}
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}
    </Card>
  )
}

