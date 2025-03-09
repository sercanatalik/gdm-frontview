"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

// Define proper types
interface RecentTrade {
    counterparty: string
    notional: number
    tradeDate: string
    instrument: string
}

interface RecentTradesProps {
    filters: Record<string, any>
}

// Helper functions moved outside component
const formatNotional = (amount: number): string => {
  const inMillions = amount / 1000000;
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(inMillions);
  
  return formatted.replace(/\.0+$/, '');
}

const getInitials = (name: string): string => {
  return name.split(' ').map(word => word.charAt(0)).join('');
}

export function RecentTrades({ filters }: RecentTradesProps) {
  const [data, setData] = useState<RecentTrade[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 4

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
          const response = await fetch('/api/financing/risk/data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filter: filters, orderBy: 'tradeDate DESC limit 100' })
          })
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters]) // Added filters dependency

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage)
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem) || []
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages || totalPages === 0

  // Navigation handlers
  const handlePrevious = () => setCurrentPage(prev => Math.max(prev - 1, 1))
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const goToPage = (page: number) => setCurrentPage(page)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {currentItems.map((trade) => (
        <TradeItem key={`${trade.counterparty}-${trade.tradeDate}`} trade={trade} />
      ))}
      
      <Pagination className="flex justify-end mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={handlePrevious}
              aria-disabled={isFirstPage}
              tabIndex={isFirstPage ? -1 : undefined}
              className={isFirstPage ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
       
          
          <PaginationItem>
            <PaginationNext 
              onClick={handleNext}
              aria-disabled={isLastPage}
              tabIndex={isLastPage ? -1 : undefined}
              className={isLastPage ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

// Extracted TradeItem component
function TradeItem({ trade }: { trade: RecentTrade }) {
  return (
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarFallback>{getInitials(trade.counterparty)}</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{trade.counterparty}</p>
        <p className="text-sm text-muted-foreground">
          {trade.instrument} • {new Date(trade.tradeDate).toLocaleDateString()}
        </p>
      </div>
      <div className="ml-auto font-medium">+{formatNotional(trade.notional)} mio</div>
    </div>
  )
}