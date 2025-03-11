"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Building2, ChevronRight } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

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

export function ExposureSummary({ 
  filters, 
  groupBy = 'SL1', 
  countBy = 'counterparty', 
  orderBy = 'totalCashOut DESC',
  title = 'Top Instruments',
  viewAllText = 'View all counterparties'
}: ExposureSummaryProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [summaries, setSummaries] = useState<GroupBySummary[]>([])

  // Fetch data from API based on filters
  useEffect(() => {
    setIsLoading(true)
    
    // Fetch data from API using POST
    fetch('/api/financing/risk/groupby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filter: filters, groupBy, countBy, orderBy }),
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
        setIsLoading(false)
      })  

  }, [filters, groupBy, countBy, orderBy])

  return (
    <Card className="h-full w-full overflow-hidden rounded-lg flex flex-col">
      <CardHeader>
          <CardTitle>
            {title}
          </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="divide-y divide-border flex-grow overflow-auto">
              {summaries.slice(0, 7).map((summary) => (
                <div
                  key={summary.groupBy}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
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
                      $
                      {(summary.totalCashOut / 1000000).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      M
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      $
                      {(summary.totalNotional / 1000000).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                      M notional
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

