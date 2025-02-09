"use client"

import { useQuery } from "@tanstack/react-query"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface Desk {
  desk: string
}

// Create a client
const queryClient = new QueryClient()

export function DeskSelect({ onDeskChange }: { onDeskChange: (desk: string) => void }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DeskSelectContent onDeskChange={onDeskChange} />
    </QueryClientProvider>
  )
}

// Separate component to use the query hook
function DeskSelectContent({ onDeskChange }: { onDeskChange: (desk: string) => void }) {
  const { data: desks, isLoading, isError } = useQuery<Desk[]>({
    queryKey: ["desk"],
    queryFn: async () => {
      const response = await fetch("/api/hms?distinct=desk")
      const { data } = await response.json() // Destructure to get just the data array
      
      // Ensure we're working with an array
      return Array.isArray(data) ? data : [data]
    }
  })

  if (isLoading) return <div>Loading desks...</div>
  if (isError) return <div>Error loading desks</div>
  if (!desks?.length) return <div>No desks available</div>
  console.log(desks);
  return (
    <Tabs defaultValue={desks[0]?.desk} onValueChange={onDeskChange}  className="space-y-4">
         <div className="flex justify-between items-center">
      <TabsList>
        {desks.map((desk, index) => (
          <TabsTrigger key={`${desk.desk}-${index}`} value={desk.desk}>
            {desk.desk}
          </TabsTrigger>
        ))}
      </TabsList>
      </div>
    </Tabs>
  )
}
