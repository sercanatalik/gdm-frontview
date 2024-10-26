"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Label } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import BreakDownPieChart from "./BreakDownPieChart"



export default function FinancingBreakdownChart(filter: {desk: string}) {
  return (
    <Card className="col-span-2 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Breakdown</CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="flex-1">
          <BreakDownPieChart />
        </div>
        <div className="flex-1">
          <BreakDownPieChart />
        </div>
      </CardContent>
    </Card>
  )
}
