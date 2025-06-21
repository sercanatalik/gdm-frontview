"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Loader2 } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MonthlyData {
  month: string
  SL1: string
  cumulative_cashout: number
  monthly_cashout: number
}

interface ChartData {
  month: string
  [key: string]: number | string
}

export function Overview({ filters }: { filters: Filter[] }) {
  const [data, setData] = useState<MonthlyData[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sl1Categories, setSl1Categories] = useState<string[]>([])

  // Process data for the stacked bar chart
  const processChartData = (data: MonthlyData[]) => {
    const categories = [...new Set(data.map(item => item.SL1))]
    setSl1Categories(categories)

    const months = [...new Set(data.map(item => item.month.trim()))]
    
    return months.map(month => {
      const monthData: ChartData = { month }
      categories.forEach(category => {
        const item = data.find(d => d.month.trim() === month && d.SL1 === category)
        monthData[category] = item ? Math.abs(item.cumulative_cashout) : 0
      })
      return monthData
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/financing/cashoutbymonth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            filter: filters,
            breakdown: 'SL1' 
          }),
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setData(result)
        setChartData(processChartData(result))
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters])

  // Define a color palette for the SL1 categories
  const getColorForCategory = (index: number) => {
    const colors = [
      '#e3e8ea',
      '#bccad0',
      '#9ba8ae',
      '#707a7e',
      '#495054',
    ]
    return colors[index % colors.length]
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
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
              <TabsTrigger value="historical">Historical Cashout by SL1</TabsTrigger>
              <TabsTrigger value="future">Future Cashout</TabsTrigger>
            </TabsList>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <TabsContent value="historical">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barGap={0}
                  barCategoryGap="10%"
                >
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
                 <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    borderRadius: "4px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                  }}
                  labelStyle={{
                    color: "#333333",
                    fontWeight: 500,
                    marginBottom: "4px",
                  }}
                  formatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {sl1Categories.map((category, index) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      stackId="a"
                      fill={getColorForCategory(index)}
                      name={category}
                      radius={index === sl1Categories.length - 1 ? [4, 4, 0, 0] : 0}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
           
            </div>
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
