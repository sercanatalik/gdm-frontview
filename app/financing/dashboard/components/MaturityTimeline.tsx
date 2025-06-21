"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Building2, DollarSign, ChevronRight } from "lucide-react"
import type { Filter } from "@/components/ui/filters"
import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow } from "date-fns"
import { TradeDetailsModal } from "../../trades/components/trade-details-modal"

import { MaturingTrade } from "@/app/financing/types"

interface MaturityTimelineProps {
  filters: Filter[]
}

// Mock data for maturing trades
const mockMaturingTrades: MaturingTrade[] = [
  {
    id: "1",
    instrumentId: "BOND001",
    instrumentName: "US Treasury 10Y",
    instrumentType: "Bond",
    counterparty: "Goldman Sachs",
    maturityDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    notional: 25000000,
    cashOut: 24750000,
    desk: "Structured Equity Products",
    portfolio: "Fixed Income",
    status: "confirmed",
    region: "Americas",
    trader: "John Smith"
  },
  {
    id: "2",
    instrumentId: "SWAP002",
    instrumentName: "EUR/USD Interest Rate Swap",
    instrumentType: "Swap",
    counterparty: "JP Morgan",
    maturityDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    notional: 50000000,
    cashOut: 49800000,
    desk: "Cash Financing Sol",
    portfolio: "Leverage",
    status: "active",
    region: "EMEA",
    trader: "Sarah Johnson"
  },
  {
    id: "3",
    instrumentId: "LOAN003",
    instrumentName: "Corporate Credit Facility",
    instrumentType: "Loan",
    counterparty: "Patel LLC",
    maturityDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    notional: 15000000,
    cashOut: 14950000,
    desk: "Structured Commodity Products",
    portfolio: "Other",
    status: "pending",
    region: "APAC",
    trader: "Michael Chen"
  },
  {
    id: "4",
    instrumentId: "DERIV004",
    instrumentName: "Equity Index Future",
    instrumentType: "Derivative",
    counterparty: "Morgan Stanley",
    maturityDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    notional: 35000000,
    cashOut: 35200000,
    desk: "Structured Index Products",
    portfolio: "Equity",
    status: "confirmed",
    region: "Americas",
    trader: "Emily Davis"
  },
  {
    id: "5",
    instrumentId: "BOND005",
    instrumentName: "Corporate Bond Series A",
    instrumentType: "Bond",
    counterparty: "Anderson-Martinez",
    maturityDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
    notional: 20000000,
    cashOut: 19850000,
    desk: "Structured Equity Products",
    portfolio: "Fixed Income",
    status: "active",
    region: "EMEA",
    trader: "David Wilson"
  },
  {
    id: "6",
    instrumentId: "REPO006",
    instrumentName: "Government Securities Repo",
    instrumentType: "Repo",
    counterparty: "Barber Inc",
    maturityDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    notional: 40000000,
    cashOut: 40100000,
    desk: "Cash Financing Sol",
    portfolio: "Leverage",
    status: "confirmed",
    region: "APAC",
    trader: "Lisa Wong"
  },
]

// Function to get initials from counterparty name
function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

// Function to get a consistent color based on the counterparty name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  ]

  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Function to get status color
function getStatusColor(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    case "active":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
  }
}

// Function to format date for display
function formatMaturityDate(date: Date): string {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return format(date, "MMM dd")
}

// Function to get days until maturity
function getDaysUntilMaturity(date: Date): number {
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function MaturityTimeline({ filters }: MaturityTimelineProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [trades, setTrades] = useState<MaturingTrade[]>([])
  const [selectedTrade, setSelectedTrade] = useState<MaturingTrade | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTradeClick = (trade: MaturingTrade) => {
    setSelectedTrade(trade)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTrade(null)
  }
  // Simulate loading and filtering based on the filters prop
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Filter logic would go here in a real implementation
      const deskFilter = filters.find((f) => f.type === "desk")

      if (deskFilter && deskFilter.value.length > 0) {
        // Filter trades by desk if desk filter is applied
        const filteredTrades = mockMaturingTrades.filter((trade) => deskFilter.value.includes(trade.desk))
        setTrades(filteredTrades)
      } else {
        setTrades(mockMaturingTrades)
      }

      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [filters])

  // Sort trades by maturity date
  const sortedTrades = trades.sort((a, b) => a.maturityDate.getTime() - b.maturityDate.getTime())

  // Calculate total notional
  const totalNotional = trades.reduce((sum, trade) => sum + trade.notional, 0)

  return (
    <Card className="overflow-hidden border-none shadow-md bg-background">
      <CardHeader className="bg-muted/60 py-2 px-4 border-b border-border/40">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-foreground/70" />
            Maturing Trades (Next 30 Days)
          </CardTitle>
          <Badge variant="outline" className="text-xs font-normal bg-background/50 backdrop-blur-sm">
            <Clock className="h-3 w-3 mr-1" />
            {trades.length} trades
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-[320px]">
            <div className="animate-spin h-8 w-8 border-4 border-foreground/20 border-t-foreground/80 rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Summary Section */}
            <div className="p-4 bg-muted/10 border-b border-border/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground/10">
                    <DollarSign className="h-4 w-4 text-foreground/70" />
                  </div>
                  <span className="font-medium">Total Notional</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">${(totalNotional / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border/40"></div>

              <div className="divide-y divide-border/20">
                {sortedTrades.map((trade, index) => {
                  const daysUntil = getDaysUntilMaturity(trade.maturityDate)
                  const isUrgent = daysUntil <= 3

                  return (
                    <div
                      key={trade.id}
                      onClick={() => handleTradeClick(trade)}
                      className={cn(
                        "relative flex items-start gap-4 p-4 transition-all duration-200 cursor-pointer",
                        "hover:bg-muted/20 active:bg-muted/30 rounded-md",
                        isUrgent && "bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-900/30",
                      )}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTradeClick(trade);
                        }
                      }}
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 flex items-center justify-center">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 bg-background",
                            isUrgent ? "border-red-500 bg-red-100 dark:bg-red-900" : "border-foreground/30",
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar className="h-10 w-10 border shadow-sm">
                              <AvatarFallback className={cn(getAvatarColor(trade.counterparty), "text-sm font-medium")}>
                                {getInitials(trade.counterparty)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium leading-none">{trade.instrumentName}</p>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-background/50">
                                  {trade.instrumentType}
                                </Badge>
                                <Badge className={cn("text-[10px] px-1.5 py-0 h-4", getStatusColor(trade.status))}>
                                  {trade.status}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  <span>{trade.counterparty}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>{trade.desk}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs">
                                <span className="font-medium">Notional: ${(trade.notional / 1000000).toFixed(1)}M</span>
                                <span className="font-medium">Cash Out: ${(trade.cashOut / 1000000).toFixed(1)}M</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div
                              className={cn(
                                "text-sm font-medium",
                                isUrgent ? "text-red-600 dark:text-red-400" : "text-foreground",
                              )}
                            >
                              {formatMaturityDate(trade.maturityDate)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {daysUntil === 0 ? "Today" : daysUntil === 1 ? "1 day" : `${daysUntil} days`}
                            </div>
                            {isUrgent && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 mt-1">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-3 bg-gradient-to-b from-muted/10 to-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground group"
              >
                <span className="group-hover:underline">View all maturing trades</span>
                <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </>
        )}

<TradeDetailsModal trade={selectedTrade} isOpen={isModalOpen} onClose={handleCloseModal} />
      </CardContent>
    </Card>
  )
}
