"use client"

import { useQuery } from "@tanstack/react-query"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"
import { StatsCard } from "./StatsCard"
import { CreditCard, Wallet, TrendingUp, Users } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { JsonEditor } from 'json-edit-react'


interface FilterCondition {
  type: string
  value: string[]
  operator: string
}

interface StatsData {
  current: number
  relative: number
  change: number
}

interface StatsResponse {
  cashOut: StatsData
  projectedCashOut: StatsData
  realisedCashOut: StatsData
  notional: StatsData
  asOfDate: string
  closestDate: string
}

interface StatsContentProps {
  onDeskChange: (desk: string) => void
}

const DEFAULT_STATS: StatsData = {
  current: 0,
  relative: 0,
  change: 0,
}

const STATS_CARDS = [
  { label: "Cash Out", key: "cashOut", icon: <CreditCard /> },
  { label: "Projected Cash Out", key: "projectedCashOut", icon: <Wallet /> },
  { label: "Realised Cash Out", key: "realisedCashOut", icon: <TrendingUp /> },
  { label: "Notional", key: "notional", icon: <Users /> },
]

// Create a client
const queryClient = new QueryClient()

export function Stats({ onDeskChange, filters }: { onDeskChange: (desk: string) => void; filters: Filter[] }) {
  const [filter, setFilter] = useState<FilterCondition[]>([])
  return (
    <QueryClientProvider client={queryClient}>
      <StatsContent onDeskChange={onDeskChange} filters={filters} />
    </QueryClientProvider>
  )
}

// Separate component to use the query hook
function StatsContent({ onDeskChange, filters }: StatsContentProps & { filters: Filter[] }) {
  const [selectedDesk, setSelectedDesk] = useState<string>("")

  const {
    data: desks = [],
    isLoading: desksLoading,
    isError: desksError,
  } = useQuery<string[]>({
    queryKey: ["desk"],
    queryFn: async () => {
      const response = await fetch("/api/tables/distinct?table=risk_f_mv&column=desk")
      const data = await response.json()
      const result = data as string[]
      if (result.length > 0 && !selectedDesk) {
        setSelectedDesk(result[0])
        onDeskChange(result[0])
      }
      return result
    }
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats", filters],
    queryFn: async () => {
      const requestBody = {
        filter: [...filters],
        relativeDt: "-1y",
      }

      const response = await fetch("/api/financing/risk/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
      const data = await response.json()
      return data
    },
    enabled: !!selectedDesk,
  })

  if (desksLoading) return <div>Loading desks...</div>
  if (desksError) return <div>Error loading desks</div>
  if (!desks?.length) return <div>No desks available</div>

  const handleDeskChange = (desk: string) => {
    setSelectedDesk(desk)
    onDeskChange(desk)
  }

  return (
    <>
      <Tabs
        defaultValue={desks.length > 0 ? desks[0] : undefined}
        onValueChange={handleDeskChange}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            {desks.map((desk, index) => (
              <TabsTrigger key={`${desk}-${index}`} value={desk}>
                {desk}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {desks.map((desk) => (
          <TabsContent key={desk} value={desk} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {STATS_CARDS.map((card, index) => (
                <StatsCard
                  key={index}
                  label={card.label}
                  icon={card.icon}
                  isLoading={statsLoading}
                  data={statsData?.[card.key] || DEFAULT_STATS}
                  days={statsData ? Math.round((new Date(statsData.asOfDate).getTime() - new Date(statsData.closestDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}   
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div>
        <JsonEditor data={statsData} />
       
      </div>
    </>
  )
}

