'use client'

import { useETF } from './etf-provider' 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ETFAnalysis } from './etf-analysis'

export function ETFList() {
  const { etfs } = useETF()

  return (
    <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-1 w-full">
      {etfs.map(etf => (
        <Card key={etf.id}>
          <CardHeader>
            <CardTitle>{etf.name}</CardTitle>
            <CardDescription>{etf.ticker}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Total Assets: ${etf.totalAssets.toFixed(2)} Billion
            </p>
            <ETFAnalysis etf={etf} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

