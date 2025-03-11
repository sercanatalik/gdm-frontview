"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MonthlyData {
  month: string
  cumulative_cashout: number
  monthly_cashout: number
}

export function PieChartsSummary() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/financing/cashoutbymonth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(),
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="col-span-4 h-full">
      <Tabs defaultValue="historical">
        <CardHeader>
          <CardTitle>
            <TabsList>
              <TabsTrigger value="historical">Historical Cashout</TabsTrigger>
              <TabsTrigger value="future">Future Cashout</TabsTrigger>
            </TabsList>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <TabsContent value="historical">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Bar
                  dataKey="monthly_cashout"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="future">
            <div className="h-[300px] flex items-center justify-center">
              <p>Future cashout overview content goes here</p>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
