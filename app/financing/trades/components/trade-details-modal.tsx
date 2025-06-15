"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  DollarSign,
  Building2,
  User,
  FileText,
  TrendingUp,
  Clock,
  MapPin,
  Briefcase,
  Copy,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow } from "date-fns"

interface MaturingTrade {
  id: string
  instrumentId: string
  instrumentName: string
  instrumentType: string
  counterparty: string
  maturityDate: Date
  notional: number
  cashOut: number
  desk: string
  portfolio: string
  status: "active" | "pending" | "confirmed"
  region: string
  trader: string
}

interface TradeDetailsModalProps {
  trade: MaturingTrade | null
  isOpen: boolean
  onClose: () => void
}

// Helper functions
function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

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

function formatMaturityDate(date: Date): string {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return format(date, "EEEE, MMMM dd, yyyy")
}

function getDaysUntilMaturity(date: Date): number {
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

export function TradeDetailsModal({ trade, isOpen, onClose }: TradeDetailsModalProps) {
  if (!trade) return null

  const daysUntil = getDaysUntilMaturity(trade.maturityDate)
  const isUrgent = daysUntil <= 7
  const pnl = trade.cashOut - trade.notional
  const pnlPercentage = ((pnl / trade.notional) * 100).toFixed(2)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border shadow-sm">
              <AvatarFallback className={cn(getAvatarColor(trade.counterparty), "text-sm font-medium")}>
                {getInitials(trade.counterparty)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{trade.instrumentName}</h2>
              <p className="text-sm text-muted-foreground">Trade ID: {trade.id}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Urgency Banner */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Badge className={cn("text-sm", getStatusColor(trade.status))}>{trade.status.toUpperCase()}</Badge>
              {isUrgent && (
                <Badge variant="destructive" className="text-sm">
                  URGENT - {daysUntil} days remaining
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Maturity Date</p>
              <p className={cn("font-semibold", isUrgent && "text-red-600 dark:text-red-400")}>
                {formatMaturityDate(trade.maturityDate)}
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Notional Amount</span>
              </div>
              <p className="text-2xl font-bold">${(trade.notional / 1000000).toFixed(2)}M</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cash Out</span>
              </div>
              <p className="text-2xl font-bold">${(trade.cashOut / 1000000).toFixed(2)}M</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">P&L</span>
              </div>
              <p className={cn("text-2xl font-bold", pnl >= 0 ? "text-green-600" : "text-red-600")}>
                {pnl >= 0 ? "+" : ""}${(pnl / 1000000).toFixed(2)}M
              </p>
              <p className={cn("text-sm", pnl >= 0 ? "text-green-600" : "text-red-600")}>
                ({pnl >= 0 ? "+" : ""}
                {pnlPercentage}%)
              </p>
            </div>
          </div>

          <Separator />

          {/* Trade Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instrument Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instrument Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Instrument ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{trade.instrumentId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(trade.instrumentId)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Instrument Name</span>
                  <span className="font-medium">{trade.instrumentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">{trade.instrumentType}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Portfolio</span>
                  <span className="font-medium">{trade.portfolio}</span>
                </div>
              </div>
            </div>

            {/* Counterparty & Trading Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Trading Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Counterparty</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className={cn(getAvatarColor(trade.counterparty), "text-xs")}>
                        {getInitials(trade.counterparty)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{trade.counterparty}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trader</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{trade.trader}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Desk</span>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{trade.desk}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Region</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{trade.region}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Days to Maturity</span>
                </div>
                <p className={cn("text-xl font-bold", isUrgent ? "text-red-600" : "text-foreground")}>
                  {daysUntil === 0 ? "Today" : daysUntil === 1 ? "1 day" : `${daysUntil} days`}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Maturity Date</span>
                </div>
                <p className="text-xl font-bold">{format(trade.maturityDate, "MMM dd, yyyy")}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Maturity Time</span>
                </div>
                <p className="text-xl font-bold">{format(trade.maturityDate, "HH:mm")}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Trading System
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Action
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
