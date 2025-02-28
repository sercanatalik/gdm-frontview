"use client"

import { useQuery } from "@tanstack/react-query"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"
import { StatsCard } from "./StatsCard"
import { CreditCard, Wallet, TrendingUp, Users } from "lucide-react"

interface FilterCondition {
  type: string;
  value: string[];
  operator: string;
}

interface Desk {
  bu: string
}


interface StatsData {
  current: number
  change: number
  previous: number
  currentDate: string
  previousDate: string
  numDays: number
}

interface StatsContentProps {
  onDeskChange: (desk: string) => void
}

const DEFAULT_STATS: StatsData = {
  current: 0,
  change: 0,
  previous: 0,
  currentDate: new Date().toISOString().split('T')[0],
  previousDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  numDays: 30
}

const STATS_CARDS = [
  { label: "Cash Out", key: "cashOut", icon: <CreditCard /> },
  { label: "Collateral Amount", key: "collateralAmount", icon: <Wallet /> },
  { label: "Daily Accrual", key: "accrualDaily", icon: <TrendingUp /> },
  { label: "Projected Accrual", key: "accrualProjected", icon: <Users /> },
  { label: "Realised Accrual", key: "accrualRealised", icon: <TrendingUp /> },
]

// Create a client
const queryClient = new QueryClient()

export function Stats({ onDeskChange }: { onDeskChange: (desk: string) => void }) {
  const [filter, setFilter] = useState<FilterCondition[]>([])
  return (
    <QueryClientProvider client={queryClient}>
      <StatsContent onDeskChange={onDeskChange} />
    </QueryClientProvider>
  )
}

// Separate component to use the query hook
function StatsContent({ onDeskChange }: StatsContentProps) {
  const [selectedDesk, setSelectedDesk] = useState<string>("")

  const { data: desks = [], isLoading: desksLoading, isError: desksError } = useQuery<Desk[]>({
    queryKey: ["desk"],
    queryFn: async () => {
      const response = await fetch("/api/financing/risk/distinct?column=bu")
      const data = await response.json()
      return data // Keep the original array of objects with 'bu' property
    }
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats", selectedDesk],
    queryFn: async () => {
      const requestBody = {
        filter: [
          {
            type: "bu",
            value: [selectedDesk],
            operator: "is"
          }
        ]
      }

      console.log(requestBody)
      const response = await fetch('/api/financing/risk/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      const data = await response.json()
      return data
    },
    enabled: !!selectedDesk
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
      defaultValue={desks.length > 0 ? desks[0].bu : undefined} 
      onValueChange={handleDeskChange} 
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <TabsList>
          {desks.map((desk, index) => (
            <TabsTrigger key={`${desk.bu}-${index}`} value={desk.bu}>
              {desk.bu}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {desks.map((desk) => (
        <TabsContent key={desk.bu} value={desk.bu} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {STATS_CARDS.map((card, index) => (
              <StatsCard 
                key={index}
                label={card.label}
                icon={card.icon}
                isLoading={statsLoading}
                data={statsData?.[card.key] || DEFAULT_STATS}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>

    <div>
      {JSON.stringify(statsData)}
    </div>
    </>
  )
}
