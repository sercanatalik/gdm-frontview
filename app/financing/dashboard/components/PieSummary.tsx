"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Building2, ChevronRight } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Label, Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTheme } from "next-themes"

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

export function PieSummary({ 
  filters, 
  groupBy = 'SL1', 
  countBy = 'counterparty', 
  orderBy = 'totalCashOut DESC',
  title = 'Top Instruments',
  viewAllText = 'View all counterparties'
}: ExposureSummaryProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [summaries, setSummaries] = useState<GroupBySummary[]>([])
  const { theme } = useTheme()

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

  // Generate colors from theme
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--primary) / 0.8)',
    'hsl(var(--primary) / 0.6)',
    'hsl(var(--primary) / 0.4)',
    'hsl(var(--primary) / 0.2)',
  ];

  // Calculate total value for relative percentages
  const totalValue = summaries.slice(0, 5).reduce((sum, item) => sum + item.totalCashOut, 0);

  // Format data for pie chart
  const pieData = summaries.slice(0, 5).map((summary, index) => ({
    name: summary.groupBy,
    value: summary.totalCashOut,
    color: COLORS[index % COLORS.length],
    distinctCount: summary.distinctCount,
    notional: summary.totalNotional,
    percentage: (summary.totalCashOut / totalValue * 100).toFixed(1)
  }));

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
            {/* Pie Chart */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={70}
                    innerRadius={30}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-medium">{data.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ${(data.value / 1000000).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}M ({data.percentage}%)
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {data.distinctCount} {countBy}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend/List */}
            <div className="divide-y divide-border">
              {summaries.slice(0, 5).map((summary, index) => {
                const percentage = (summary.totalCashOut / totalValue * 100).toFixed(1);
                return (
                  <div
                    key={summary.groupBy}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
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
                        M <span className="text-xs text-muted-foreground">({percentage}%)</span>
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
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      {!isLoading && (
        <div className="p-3 bg-muted/10 mt-auto">
      
        </div>
      )}
    </Card>
  )
}

