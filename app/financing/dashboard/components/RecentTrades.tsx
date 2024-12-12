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
        setData(result.data)
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
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(data.length / itemsPerPage)

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
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {trade.counterparty.split(' ').map(word => word.charAt(0)).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{trade.counterparty}</p>
            <p className="text-sm text-muted-foreground">
              {trade.sector}
            </p>
          </div>
          <div className="ml-auto font-medium">+{trade.notional.toFixed(2)} mio</div>
        </div>
      ))}
      
      <Pagination className="flex justify-end mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
             
            />
          </PaginationItem>
         
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}