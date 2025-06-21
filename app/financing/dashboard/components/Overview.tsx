"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { Loader2, Maximize2, Minimize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
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
  const { theme } = useTheme()
  const [sl1Categories, setSl1Categories] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Process data for the stacked bar chart
  const processChartData = (data: MonthlyData[]) => {
    console.log('Raw data received for processing:', data)
    
    if (!data || data.length === 0) {
      console.warn('No data provided to processChartData')
      return []
    }

    const categories = [...new Set(data.map(item => item.SL1))]
    console.log('Unique categories found:', categories)
    setSl1Categories(categories)

    const months = [...new Set(data.map(item => item.month.trim()))]
    console.log('Unique months found:', months)
    
    const processedData = months.map(month => {
      const monthData: ChartData = { month }
      
      // Initialize all categories with 0
      categories.forEach(category => {
        monthData[category] = 0
      })
      
      // Sum up values for each category in this month
      const monthItems = data.filter(item => item.month.trim() === month)
      console.log(`Processing month ${month}, found ${monthItems.length} items`)
      
      monthItems.forEach(item => {
        const currentValue = monthData[item.SL1] as number
        const newValue = currentValue + (item.monthly_cashout || 0)
        monthData[item.SL1] = newValue
        console.log(`  - Category ${item.SL1}: ${currentValue} + ${item.monthly_cashout} = ${newValue}`)
      })
      
      console.log(`Month ${month} data:`, monthData)
      return monthData
    })
    
    console.log('Final processed data:', processedData)
    return processedData
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from API...')
        const response = await fetch('/api/financing/cashoutbymonth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filter: filters, breakdown: 'SL1' })
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        console.log('API Response:', result)
        setData(result)
        const processedData = processChartData(result)
        console.log('Processed Chart Data:', processedData)
        setChartData(processedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getColorForCategory = (index: number) => {
    const colors = [
      '#F5F9FC',
      '#E2F0F9',
      '#C9E4F2',
      '#A5C0DD',
      '#94A3B8',
      '#64748B'
    ]
    return colors[index % colors.length]
  }

  // Render chart component
  const renderChart = () => {
    console.log('Rendering chart with data:', chartData)
    console.log('Categories:', sl1Categories)
    
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>No data available for the chart</p>
        </div>
      )
    }
    
    return (
      <div className="w-full h-full">
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
            <CartesianGrid 
              stroke={theme === 'dark' ? '#FFFFFF' : '#000000'} 
              strokeDasharray="3 3" 
              vertical={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`}
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
              formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`}
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
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle></CardTitle>
        </div>
        <TooltipProvider>
          <TooltipComponent>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Maximize</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Maximize view</p>
            </TooltipContent>
          </TooltipComponent>
        </TooltipProvider>
      </CardHeader>
      <Tabs defaultValue="historical" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="historical">Historical Cashout by SL1</TabsTrigger>
          <TabsTrigger value="future">Future Cashout</TabsTrigger>
        </TabsList>
        <CardContent className="pl-2">
          <TabsContent value="historical" className="mt-0">
            <div className="h-[400px]">
              {renderChart()}
            </div>
          </TabsContent>
          <TabsContent value="future" className="mt-0">
            <div className="h-[400px] flex items-center justify-center">
              <p>Future cashout overview content goes here</p>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="w-[95vw] h-[90vh] max-w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
            
             Cashout by SL1
            </div>
            <div className="flex gap-2">
    
        
            </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="w-full h-full min-h-0">
              {renderChart()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
