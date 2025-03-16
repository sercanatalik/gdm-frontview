"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChartIcon, BarChartIcon } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RevenueBreakdownProps {
  filters: Filter[]
}

// Mock data for revenue by category
const revenueByCategory = [
  { name: "Trading", value: 42 },
  { name: "Advisory", value: 28 },
  { name: "Financing", value: 18 },
  { name: "Other", value: 12 },
]

// Mock data for revenue by region
const revenueByRegion = [
  { name: "Americas", value: 45 },
  { name: "EMEA", value: 35 },
  { name: "APAC", value: 20 },
]

// Mock data for revenue by month
const revenueByMonth = [
  { name: "Jan", value: 12.5 },
  { name: "Feb", value: 14.2 },
  { name: "Mar", value: 16.8 },
  { name: "Apr", value: 15.3 },
  { name: "May", value: 18.1 },
  { name: "Jun", value: 17.5 },
  { name: "Jul", value: 19.2 },
  { name: "Aug", value: 20.4 },
  { name: "Sep", value: 21.8 },
  { name: "Oct", value: 22.5 },
  { name: "Nov", value: 23.1 },
  { name: "Dec", value: 24.7 },
]

// Custom active shape for pie chart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

  return (
    <g>
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="currentColor" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy} textAnchor="middle" fill="currentColor" className="text-lg font-semibold">
        {`${value}%`}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill="currentColor" className="text-xs text-muted-foreground">
        {`${(percent * 100).toFixed(0)}% of total`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.8}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 8}
        fill={fill}
        opacity={0.6}
      />
    </g>
  )
}

export function RevenueCharts({}: RevenueBreakdownProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [activeRegionIndex, setActiveRegionIndex] = useState(0)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  // Generate monochromatic colors for pie charts
  const generateMonochromaticColors = (count: number, opacity = 0.7) => {
    const baseOpacity = opacity
    return Array.from({ length: count }, (_, i) => {
      const adjustedOpacity = baseOpacity - i * 0.1
      return `rgba(var(--foreground), ${Math.max(0.2, adjustedOpacity)})`
    })
  }

  const categoryColors = generateMonochromaticColors(revenueByCategory.length)
  const regionColors = generateMonochromaticColors(revenueByRegion.length, 0.8)

  // Custom tooltip component for pie charts
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border/40 p-2 rounded-md shadow-md">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm">{`${payload[0].value}%`}</p>
        </div>
      )
    }
    return null
  }

  // Render pie chart component
  const renderPieChart = (
    data: typeof revenueByCategory | typeof revenueByRegion,
    colors: string[],
    activeIndex: number,
    setActiveIndex: (index: number) => void,
    title: string,
    icon: React.ReactNode
  ) => (
    <div className="bg-muted/10 rounded-lg p-4 h-[full]">
      <h3 className="text-sm font-medium mb-1 flex items-center gap-1">
        {icon}
        {title}
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={renderPieTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  return (
    <Card >
      <CardHeader >
        <div className="flex justify-between items-center">
          <CardTitle>
           
            Revenue Breakdown
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-[full]">
            <div className="animate-spin h-8 w-8 border-4 border-foreground/20 border-t-foreground/80 rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
            {/* Pie Chart - Revenue by Category */}
            {renderPieChart(
              revenueByCategory,
              categoryColors,
              activeCategoryIndex,
              setActiveCategoryIndex,
              "Revenue by Category",
              <PieChartIcon className="h-3.5 w-3.5 text-foreground/70" />
            )}

            {/* Pie Chart - Revenue by Region */}
            {renderPieChart(
              revenueByRegion,
              regionColors,
              activeRegionIndex,
              setActiveRegionIndex,
              "Revenue by Region",
              <PieChartIcon className="h-3.5 w-3.5 text-foreground/70" />
            )}

 
          </div>
        )}
      </CardContent>
    </Card>
  )
}

