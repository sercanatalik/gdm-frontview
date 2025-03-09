"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Building2, ChevronRight } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface CounterpartySummary {
  counterparty: string
  totalCashOut: number
  totalNotional: number
  instrumentCount: number
  change: number // Percentage change
}

interface CounterpartySummaryProps {
  filters: Filter[]
}

// Mock data for counterparty summary
const mockCounterpartyData: CounterpartySummary[] = [
  {
    counterparty: "Patel LLC",
    totalCashOut: 28770000,
    totalNotional: 125400000,
    instrumentCount: 12,
    change: 3.2,
  },
  {
    counterparty: "Anderson-Martinez",
    totalCashOut: 25620000,
    totalNotional: 98700000,
    instrumentCount: 8,
    change: -1.7,
  },
  {
    counterparty: "Smith, Thomas and Hunter",
    totalCashOut: 35390000,
    totalNotional: 142500000,
    instrumentCount: 15,
    change: 5.4,
  },
  {
    counterparty: "Barber Inc",
    totalCashOut: 14630000,
    totalNotional: 67800000,
    instrumentCount: 6,
    change: -2.3,
  },
  {
    counterparty: "Goldman Sachs",
    totalCashOut: 42150000,
    totalNotional: 187300000,
    instrumentCount: 18,
    change: 7.8,
  },
  {
    counterparty: "JP Morgan",
    totalCashOut: 31280000,
    totalNotional: 134600000,
    instrumentCount: 14,
    change: 2.1,
  },
  {
    counterparty: "Morgan Stanley",
    totalCashOut: 19450000,
    totalNotional: 86200000,
    instrumentCount: 9,
    change: -0.8,
  },
]

// Function to get initials from counterparty name
function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

export function CounterpartySummary({ filters }: CounterpartySummaryProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [summaries, setSummaries] = useState<CounterpartySummary[]>([])

  // Simulate loading and filtering based on the filters prop
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      // If there are desk filters, filter the mock data (just as an example)
      const deskFilter = filters.find((f) => f.type === "desk")

      if (deskFilter && deskFilter.value.includes("Structured Equity Products")) {
        // For this specific desk, show a subset of counterparties
        setSummaries(mockCounterpartyData.slice(0, 4))
      } else {
        // Otherwise show all mock data
        setSummaries(mockCounterpartyData)
      }

      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [filters])

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
          <CardTitle>
            Top Counterparties
          </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-[280px]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {summaries.slice(0, 5).map((summary) => (
                <div
                  key={summary.counterparty}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(summary.counterparty)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{summary.counterparty}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                          {summary.instrumentCount} instruments
                        </Badge>
                        <span
                          className={cn(
                            "flex items-center text-xs",
                            summary.change > 0 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {summary.change > 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          )}
                          {Math.abs(summary.change)}%
                        </span>
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
            <div className="p-3 bg-muted/10">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">
                View all counterparties
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

