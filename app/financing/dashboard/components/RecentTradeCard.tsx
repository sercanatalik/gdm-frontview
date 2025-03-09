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
  import type { Filter } from "@/components/ui/filters"
  export function RecentTradesCard({ filters }: { filters: Filter[] }) {
    const [tradeCount, setTradeCount] = useState<any | null>(null)

    useEffect(() => {
      async function fetchTradeCount() {
        try {
          const response = await fetch('/api/financing/risk/count', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filter: filters })
          })
          const data = await response.json()
          console.log(data)
          setTradeCount(data[0])
        } catch (error) {
          console.error('Error fetching trade count:', error)
        }
      }

      fetchTradeCount()
    }, [])

    return (
      <Card className="col-span-3 h-full">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>
            {tradeCount !== null ? (
              <span>
                This month's activity: <strong>{tradeCount.tradeCount}</strong> trades across{" "}
                <strong>{tradeCount.counterpartyCount}</strong> counterparties,{" "}
                <strong>{tradeCount.instrumentCount}</strong> instruments, and{" "}
                <strong>{tradeCount.currencyCount}</strong> currencies
              </span>
            ) : (
              'Loading trade count...'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTrades filters={filters} />
        </CardContent>
      </Card>
    )
  }