"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, BarChart3, ChevronUp, ChevronDown, PieChart } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { cn } from "@/lib/utils"

interface PnlData {
  id: string
  asOfDate: string
  desk: string | null
  SL1: string | null
  portfolio: string | null
  book: string
  YTD: number | null
  MTD: number | null
  DTD: number | null
  AOP: number | null
  PPNL: number | null
}

interface PnlPerformanceProps {

}

// Group data by desk or portfolio
function groupDataBy(
  data: PnlData[],
  groupKey: "desk" | "portfolio" | "SL1",
): {
  name: string
  YTD: number
  MTD: number
  AOP: number
  ytdProgress: number
  mtdProgress: number
}[] {
  const grouped = data.reduce(
    (acc, item) => {
      const key = item[groupKey] || "Unknown"
      if (!acc[key]) {
        acc[key] = {
          name: key,
          YTD: 0,
          MTD: 0,
          AOP: 0,
          count: 0,
        }
      }

      if (item.YTD) acc[key].YTD += item.YTD
      if (item.MTD) acc[key].MTD += item.MTD
      if (item.AOP) acc[key].AOP += item.AOP
      acc[key].count++

      return acc
    },
    {} as Record<string, any>,
  )

  return Object.values(grouped)
    .map((group) => ({
      name: group.name,
      YTD: group.YTD,
      MTD: group.MTD,
      AOP: group.AOP,
      ytdProgress: (group.YTD / group.AOP) * 100,
      mtdProgress: (group.MTD / (group.AOP / 12)) * 100, // Assuming AOP is annual and MTD is compared to 1/12 of AOP
    }))
    .sort((a, b) => b.YTD - a.YTD) // Sort by YTD descending
}

export function RevenueCard() {
  const [isLoading, setIsLoading] = useState(true)
  const [pnlData, setPnlData] = useState<PnlData[]>([])
  const [viewMode, setViewMode] = useState<"desk" | "portfolio" | "SL1">("desk")
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  // Fetch data from API based on filters
  useEffect(() => {
    setIsLoading(true)

    const fetchData = async () => {
      try {
        const response = await fetch('/api/financing/pnl/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
         
        })

        if (!response.ok) {
          throw new Error('Failed to fetch PnL data')
        }

        const data = await response.json()
        setPnlData(data)
      } catch (error) {
        console.error('Error fetching PnL data:', error)
        setPnlData([]) // Set empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const groupedData = groupDataBy(pnlData, viewMode)

  // Calculate totals
  const totals = pnlData.reduce(
    (acc, item) => {
      if (item.YTD) acc.YTD += item.YTD
      if (item.MTD) acc.MTD += item.MTD
      if (item.AOP) acc.AOP += item.AOP
      return acc
    },
    { YTD: 0, MTD: 0, AOP: 0 },
  )

  const totalYtdProgress = (totals.YTD / totals.AOP) * 100
  const totalMtdProgress = (totals.MTD / (totals.AOP / 12)) * 100

  const toggleExpand = (name: string) => {
    setExpandedGroups((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  return (
    <Card >
      <CardHeader >
        <div className="flex justify-between items-center">
          <CardTitle >
            Revenue & PnL Performance
          </CardTitle>
          <Tabs defaultValue="desk" className="w-auto h-7">
            <TabsList className="h-7 p-0.5 bg-background/80 backdrop-blur-sm">
              <TabsTrigger
                value="desk"
                className="text-xs px-2 h-6 data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground"
                onClick={() => setViewMode("desk")}
              >
                By Desk
              </TabsTrigger>
              <TabsTrigger
                value="portfolio"
                className="text-xs px-2 h-6 data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground"
                onClick={() => setViewMode("portfolio")}
              >
                By Portfolio
              </TabsTrigger>
              <TabsTrigger
                value="SL1"
                className="text-xs px-2 h-6 data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground"
                onClick={() => setViewMode("SL1")}
              >
                By SL1
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-[280px]">
            <div className="animate-spin h-8 w-8 border-4 border-foreground/20 border-t-foreground/80 rounded-full"></div>
          </div>
        ) : (
          <div>
            {/* Total Summary */}
            <div className="p-4 bg-muted/10 border-b border-border/30">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground/10">
                    <DollarSign className="h-4 w-4 text-foreground/70" />
                  </div>
                  <span className="font-medium">Total PnL</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">${(totals.YTD / 1000000).toFixed(1)}M</span>
                  <span className="text-xs text-muted-foreground ml-1">/ ${(totals.AOP / 1000000).toFixed(1)}M</span>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-medium">YTD Progress</span>
                    <span className="font-medium">{totalYtdProgress.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 bg-foreground/60"
                      style={{ width: `${Math.min(totalYtdProgress, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-medium">MTD Progress</span>
                    <span className="font-medium">{totalMtdProgress.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 bg-foreground/60"
                      style={{ width: `${Math.min(totalMtdProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown by selected view */}
            <div className="divide-y divide-border/30">
              {groupedData.map((group, index) => {
                const isExpanded = expandedGroups.includes(group.name)
                return (
                  <div
                    key={index}
                    className={cn("transition-colors duration-200", isExpanded ? "bg-muted/20" : "hover:bg-muted/10")}
                  >
                    <div className="p-4 cursor-pointer" onClick={() => toggleExpand(group.name)}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-foreground/10">
                            <PieChart className="h-3 w-3 text-foreground/70" />
                          </div>
                          <Badge
                            variant="outline"
                            className="h-6 text-xs font-normal bg-background/50 backdrop-blur-sm"
                          >
                            {group.name}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">${(group.YTD / 1000000).toFixed(1)}M</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            / ${(group.AOP / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-foreground/70" />
                            <span>YTD</span>
                          </div>
                          <span className="font-medium">{group.ytdProgress.toFixed(1)}%</span>
                        </div>
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                          <div
                            className={cn(
                              "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                              group.ytdProgress >= 100 ? "bg-foreground/80" : "bg-foreground/60",
                            )}
                            style={{ width: `${Math.min(group.ytdProgress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border/30 space-y-2 animate-in fade-in duration-200">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-foreground/70" />
                              <span>MTD</span>
                            </div>
                            <span className="font-medium">{group.mtdProgress.toFixed(1)}%</span>
                          </div>
                          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                            <div
                              className={cn(
                                "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                                group.mtdProgress >= 100 ? "bg-foreground/80" : "bg-foreground/60",
                              )}
                              style={{ width: `${Math.min(group.mtdProgress, 100)}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                            <div className="bg-foreground/5 p-2 rounded-md">
                              <div className="text-muted-foreground mb-1">YTD</div>
                              <div className="font-medium">${(group.YTD / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="bg-foreground/5 p-2 rounded-md">
                              <div className="text-muted-foreground mb-1">MTD</div>
                              <div className="font-medium">${(group.MTD / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="bg-foreground/5 p-2 rounded-md">
                              <div className="text-muted-foreground mb-1">AOP Target</div>
                              <div className="font-medium">${(group.AOP / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="bg-foreground/5 p-2 rounded-md">
                              <div className="text-muted-foreground mb-1">Monthly Target</div>
                              <div className="font-medium">${(group.AOP / 12 / 1000000).toFixed(2)}M</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

