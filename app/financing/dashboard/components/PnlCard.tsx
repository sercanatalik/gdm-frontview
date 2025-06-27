"use client"

import { useEffect } from "react"
import { useStore } from "@tanstack/react-store"
import { store, fetchPnlData, setViewMode, toggleExpandGroup } from "@/app/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, ChevronUp, ChevronDown, PieChart } from "lucide-react"
import { cn } from "@/lib/utils"

interface PnlData {
  desk: string | null
  SL1: string | null
  portfolio: string | null
  YTD: number
  MTD: number
  AOP: number
}

type ViewMode = "desk" | "portfolio" | "SL1"

interface GroupedData {
  name: string
  YTD: number
  MTD: number
  AOP: number
  ytdProgress: number
  mtdProgress: number
}

interface Totals {
  YTD: number
  MTD: number
  AOP: number
}

// Helper functions
function groupDataBy(
  data: PnlData[],
  groupKey: ViewMode,
): GroupedData[] {
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

      acc[key].YTD += item.YTD
      acc[key].MTD += item.MTD
      acc[key].AOP += item.AOP
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
      mtdProgress: (group.MTD / (group.AOP / 12)) * 100,
    }))
    .sort((a, b) => b.YTD - a.YTD)
}

function calculateTotals(data: PnlData[]): Totals {
  return data.reduce(
    (acc, item) => {
      acc.YTD += item.YTD
      acc.MTD += item.MTD
      acc.AOP += item.AOP
      return acc
    },
    { YTD: 0, MTD: 0, AOP: 0 },
  )
}

function formatCurrency(value: number): string {
  return `$${(value / 1000000).toFixed(1)}M`
}

function formatCurrencyPrecise(value: number): string {
  return `$${(value / 1000000).toFixed(2)}M`
}

// Components
function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/10">
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 bg-foreground/60"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}

function SmallProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
      <div
        className={cn(
          "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
          percentage >= 100 ? "bg-foreground/80" : "bg-foreground/60",
        )}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}

function TotalSummary({ totals, ytdProgress, mtdProgress }: { totals: Totals, ytdProgress: number, mtdProgress: number }) {
  return (
    <div className="p-4 bg-muted/10 border-b border-border/30">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground/10">
            <DollarSign className="h-4 w-4 text-foreground/70" />
          </div>
          <span className="font-medium">Total PnL</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium">{formatCurrency(totals.YTD)}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {formatCurrency(totals.AOP)}</span>
        </div>
      </div>
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium">YTD Progress</span>
            <span className="font-medium">{ytdProgress.toFixed(1)}%</span>
          </div>
          <ProgressBar percentage={ytdProgress} />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium">MTD Progress</span>
            <span className="font-medium">{mtdProgress.toFixed(1)}%</span>
          </div>
          <ProgressBar percentage={mtdProgress} />
        </div>
      </div>
    </div>
  )
}

function GroupItem({ group, isExpanded, onToggle }: { 
  group: GroupedData, 
  isExpanded: boolean, 
  onToggle: () => void 
}) {
  return (
    <div
      className={cn("transition-colors duration-200", isExpanded ? "bg-muted/20" : "hover:bg-muted/10")}
    >
      <div className="p-4 cursor-pointer" onClick={onToggle}>
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
            <span className="text-sm font-medium">{formatCurrency(group.YTD)}</span>
            <span className="text-xs text-muted-foreground ml-1">
              / {formatCurrency(group.AOP)}
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
          <SmallProgressBar percentage={group.ytdProgress} />
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
            <SmallProgressBar percentage={group.mtdProgress} />

            <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
              <div className="bg-foreground/5 p-2 rounded-md">
                <div className="text-muted-foreground mb-1">YTD</div>
                <div className="font-medium">{formatCurrencyPrecise(group.YTD)}</div>
              </div>
              <div className="bg-foreground/5 p-2 rounded-md">
                <div className="text-muted-foreground mb-1">MTD</div>
                <div className="font-medium">{formatCurrencyPrecise(group.MTD)}</div>
              </div>
              <div className="bg-foreground/5 p-2 rounded-md">
                <div className="text-muted-foreground mb-1">AOP Target</div>
                <div className="font-medium">{formatCurrencyPrecise(group.AOP)}</div>
              </div>
              <div className="bg-foreground/5 p-2 rounded-md">
                <div className="text-muted-foreground mb-1">Monthly Target</div>
                <div className="font-medium">{formatCurrencyPrecise(group.AOP / 12)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-[280px]">
      <div className="animate-spin h-8 w-8 border-4 border-foreground/20 border-t-foreground/80 rounded-full"></div>
    </div>
  )
}

// Main component
export function PnlCard() {
  const { isLoading, pnlData, viewMode, expandedGroups } = useStore(store)

  useEffect(() => {
    fetchPnlData()
  }, [])

  const groupedData = groupDataBy(pnlData, viewMode)
  const totals = calculateTotals(pnlData)
  const totalYtdProgress = (totals.YTD / totals.AOP) * 100
  const totalMtdProgress = (totals.MTD / (totals.AOP / 12)) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            PnL Performance
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
          <LoadingSpinner />
        ) : (
          <div>
            <TotalSummary 
              totals={totals} 
              ytdProgress={totalYtdProgress} 
              mtdProgress={totalMtdProgress} 
            />

            <div className="divide-y divide-border/30">
              {groupedData.map((group, index) => (
                <GroupItem
                  key={index}
                  group={group}
                  isExpanded={expandedGroups.includes(group.name)}
                  onToggle={() => toggleExpandGroup(group.name)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}