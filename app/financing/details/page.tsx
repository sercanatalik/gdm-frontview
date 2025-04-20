"use client"

import { useSearchParams } from "next/navigation"
import { useMemo, useEffect, useState } from "react"
import { 
  Banknote, 
  BarChart2, 
  DollarSign,
  Filter,
  Scale,
  TrendingUp 
} from "lucide-react"

import { StatsCard } from "../dashboard/components/StatsCard"
import {Overview} from "../dashboard/components/Overview"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import {ExposureSummary} from "../dashboard/components/ExposureSummary"


interface Filter {
  id: string;
  type: string;
  operator: string;
  value: string[];
}

interface MetricValue {
  current: number;
  relative: number;
  change: number;
}

interface StatsData {
  totalValue: MetricValue;
  notional: MetricValue;
  instruments: number;
  trades: number;
  risk: number;
  asOfDate: string;
  closestDate: string;
}

const DEFAULT_STATS = {
  current: 0,
  change: 0,
  previous: 0,
  currentDate: new Date().toISOString(),
  previousDate: new Date().toISOString()
}

const STATS_CARDS = [
  {
    label: "Total Value",
    key: "totalValue" as const,
    icon: <Banknote className="h-4 w-4" />,
    format: (value: MetricValue) => ({
      current: value.current,
      change: value.change,
      previous: value.relative,
      currentDate: new Date().toISOString(),
      previousDate: new Date().toISOString()
    })
  },
  {
    label: "Notional Value",
    key: "notional" as const,
    icon: <DollarSign className="h-4 w-4" />,
    format: (value: MetricValue) => ({
      current: value.current,
      change: value.change,
      previous: value.relative,
      currentDate: new Date().toISOString(),
      previousDate: new Date().toISOString()
    })
  },
  {
    label: "Instruments",
    key: "instruments" as const,
    icon: <BarChart2 className="h-4 w-4" />,
    format: (value: number) => ({
      current: value,
      change: 0,
      previous: value,
      currentDate: new Date().toISOString(),
      previousDate: new Date().toISOString()
    })
  },
  {
    label: "Trades",
    key: "trades" as const,
    icon: <Scale className="h-4 w-4" />,
    format: (value: number) => ({
      current: value,
      change: 0,
      previous: value,
      currentDate: new Date().toISOString(),
      previousDate: new Date().toISOString()
    })
  },
  {
    label: "Risk",
    key: "risk" as const,
    icon: <TrendingUp className="h-4 w-4" />,
    format: (value: MetricValue) => ({
      current: value.current,
      change: value.change,
      previous: value.relative,
      currentDate: new Date().toISOString(),
      previousDate: new Date().toISOString()
    })
  }
] as const

const GROUP_TYPE_CONFIG = {
  instrument: {
    groupBy: "counterparty",
    countBy: "tradeId",
    orderBy: "totalCashOut DESC",
    title: "Counterparties",
    viewAllText: "View all Trades"
  },
  counterparty: {
    groupBy: "instrument",
    countBy: "tradeId",
    orderBy: "totalCashOut DESC",
    title: "Collateral",
    viewAllText: "View all Counterparties"
  },
  sl1: {
    groupBy: "sl1",
    countBy: "tradeId",
    orderBy: "totalCashOut DESC",
    title: "Desk",
    viewAllText: "View all SL1"
  }
} as const

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function capitalizeFirstChar(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function DetailsPage() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || ""
  const filtersParam = searchParams.get("filters") || "[]"
  const groupType = searchParams.get("groupType") || ""
  
  const [filters, setFilters] = useState<Filter[]>([])
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const parsedFilters = JSON.parse(filtersParam) as Filter[]
      const parentFilter = {
        id: generateUUID(),
        type: groupType,
        operator: "is",
        value: [name]
      }
      setFilters([...parsedFilters, parentFilter])
    } catch (e) {
      console.error("Failed to parse filters:", e)
      setFilters([])
    }
  }, [filtersParam, name])

  useEffect(() => {
    const fetchStats = async () => {
      if (filters.length === 0) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/financing/risk/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filter: filters,
            relativeDt: "-1m",
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`)
        }

        const data = await response.json()
        setStatsData(data)
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to fetch stats"
        setError(errorMessage)
        console.error("Error fetching stats:", e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [filters])

  return (
    <ContentLayout title={`${capitalizeFirstChar(groupType)} Details`}>
      <div className="flex-1 space-y-4 p-5s pt-0">
        <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STATS_CARDS.map((card, index) => {
            const value = statsData?.[card.key]
            return (
              <StatsCard
                key={index}
                label={card.label}
                icon={card.icon}
                isLoading={isLoading}
                data={value ? card.format(value as any) : DEFAULT_STATS}
                days={statsData ? Math.round((new Date(statsData.asOfDate).getTime() - new Date(statsData.closestDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              />
            )
          })}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="col-span-1">
            <ExposureSummary 
              filters={filters} 
              {...GROUP_TYPE_CONFIG[groupType as keyof typeof GROUP_TYPE_CONFIG]} 
              ignoreFilter={groupType}
            />
            {groupType}
          </div>
          <div className="col-span-2">
            {/* <RecentTradesCard filters={filters} /> */}
            <Overview filters={filters} /> 
          </div>
          <div className="col-span-2">
            {JSON.stringify(filters)}
          </div>
        </div>

      </div>
    </ContentLayout>
  
  )
}
