"use client"

import { useQuery } from "@tanstack/react-query"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"
import { StatsCard } from "./StatsCard"
import { CreditCard } from "lucide-react"

interface Desk {
  desk: string
}

interface StatsContentProps {
  onDeskChange: (desk: string) => void
}

// Create a client
const queryClient = new QueryClient()

export function Stats({ onDeskChange }: { onDeskChange: (desk: string) => void }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StatsContent onDeskChange={onDeskChange} />
    </QueryClientProvider>
  )
}

// Separate component to use the query hook
function StatsContent({ onDeskChange }: StatsContentProps) {
  const { data: desks, isLoading: desksLoading, isError: desksError } = useQuery<Desk[]>({
    queryKey: ["desk"],
    queryFn: async () => {
      const response = await fetch("/api/hms?distinct=desk")
      const { data } = await response.json()
      return Array.isArray(data) ? data : [data]
    }
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/financing/stats")
      return response.json()
    }
  })

  if (desksLoading) return <div>Loading desks...</div>
  if (desksError) return <div>Error loading desks</div>
  if (!desks?.length) return <div>No desks available</div>

  return (
    <Tabs defaultValue={desks[0]?.desk} onValueChange={onDeskChange} className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
          {desks.map((desk, index) => (
            <TabsTrigger key={`${desk.desk}-${index}`} value={desk.desk}>
              {desk.desk}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {desks.map((desk) => (
        <TabsContent key={desk.desk} value={desk.desk} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              label="Total Loans" 
              icon={<CreditCard />} 
              isLoading={statsLoading}
              data={statsData?.[desk.desk] || {
                current: 0,
                change: 0,
                previous: 0,
                currentDate: new Date().toISOString().split('T')[0],
                previousDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                numDays: 30
              }}
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
