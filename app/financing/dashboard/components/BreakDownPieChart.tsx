import React from 'react';
import { Button } from '@/components/ui/button';
import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Label } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = {
    desk: [
        { name: "EM", value: 275 },
        { name: "CLO/ABS", value: 200 },
        { name: "Loans", value: 287 },
        { name: "Others", value: 173 }
    ],
    region: [
        { name: "APAC", value: 300 },
        { name: "EMEA", value: 250 },
        { name: "Americas", value: 385 }
    ],
    product: [
        { name: "Fixed Income", value: 400 },
        { name: "Equities", value: 300 },
        { name: "Other", value: 235 }
    ]
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))']
interface BreakDownPieChartProps {
  // Add any props here if needed
}

const BreakDownPieChart: React.FC<BreakDownPieChartProps> = () => {
    const [breakdownField, setBreakdownField] = useState("desk")

    const totalValue = data[breakdownField].reduce((sum, item) => sum + item.value, 0)

    
  return (
    <div className="w-full">
        <ChartContainer
            config={{
                ...data[breakdownField].reduce((acc, item, index) => ({
                    ...acc,
                    [item.name]: {
                        label: item.name,
                        color: COLORS[index % COLORS.length],
                    },
                }), {}),
            }}
            className="mx-auto aspect-[2/1] w-full"
        >
            <PieChart width={500} height={300}>
                <Pie
                    data={data[breakdownField]}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                >
                    {data[breakdownField].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-3xl font-bold"
                                        >
                                            100
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                        >
                                            Cashout
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
        
        <div className="flex justify-center space-x-2 pt-2">
            <Button
                variant={breakdownField === "desk" ? "default" : "outline"}
                size="xs"
                className="h-6 px-2 text-xs"
                onClick={() => setBreakdownField("desk")}
            >
                Desk
            </Button>
            <Button
                variant={breakdownField === "region" ? "default" : "outline"}
                size="xs"
                className="h-6 px-2 text-xs"
                onClick={() => setBreakdownField("region")}
            >
                Region
            </Button>
            <Button
                variant={breakdownField === "product" ? "default" : "outline"}
                size="xs"
                className="h-6 px-2 text-xs"
                onClick={() => setBreakdownField("product")}
            >
                Product
            </Button>
        </div>
    </div>
  );
};

export default BreakDownPieChart;
