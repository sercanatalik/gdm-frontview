"use client"

import { useState, useEffect } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { RecentTrades } from "@/app/financing/dashboard/components/RecentTrades"
  
  export function RecentTradesCard() {
    const [tradeCount, setTradeCount] = useState<number | null>(null)

    useEffect(() => {
      async function fetchTradeCount() {
        try {
          const response = await fetch('/api/financing/stats?measure=countrecenttrades')
          const data = await response.json()
          setTradeCount(data.data)
        } catch (error) {
          console.error('Error fetching trade count:', error)
        }
      }

      fetchTradeCount()
    }, [])

    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>
            {tradeCount !== null
              ? `We made ${tradeCount} trades this month.`
              : 'Loading trade count...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTrades />
        </CardContent>
      </Card>
    )
  }