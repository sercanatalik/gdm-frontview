"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Loader2 } from "lucide-react" // Add this import

import { useEffect, useState } from "react"

interface RecentTrade {
    counterparty: string
    notional: number
    latest_trade_date: string
    sector: string
}
 

export function RecentTrades() {
  const [data, setData] = useState<RecentTrade[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true) // Add this line
  const itemsPerPage = 5

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true) // Add this line
      try {
        const response = await fetch('/api/financing/stats?measure=recenttrades')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false) // Add this line
      }
    }

    fetchData()
  }, [])
  
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  // Add safety checks for data
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage)
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem) || []

  // Add disabled states for pagination buttons
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  // Format the notional amount with proper currency formatting
  const formatNotional = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {currentItems.map((trade, index) => (
        <div key={`${trade.counterparty}-${trade.latest_trade_date}`} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${trade.counterparty}.png`} alt={trade.counterparty} />
            <AvatarFallback>
              {trade.counterparty.split(' ').map(word => word.charAt(0)).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{trade.counterparty}</p>
            <p className="text-sm text-muted-foreground">
              {trade.sector} • {new Date(trade.latest_trade_date).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto font-medium">+{formatNotional(trade.notional)} mio</div>
        </div>
      ))}
      
      <Pagination className="flex justify-end mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={isFirstPage}
              className={isFirstPage ? 'cursor-not-allowed opacity-50' : ''}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={isLastPage}
              className={isLastPage ? 'cursor-not-allowed opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}