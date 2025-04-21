'use client'

import { useSearchParams } from "next/navigation"

import { ContentLayout } from "@/components/admin-panel/content-layout";
    

export default function TradesPricePage() {
    const searchParams = useSearchParams()
    const tradeId = searchParams.get("id")
    return (
        <ContentLayout title={`${name} Trades`}>
            <div className="w-full h-full flex flex-col">
               Trade ID: {tradeId}
      </div>
    </ContentLayout>
  )
}

