"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

export type Trade = {
  book: string
  tradeId: string
  tradeDate: string
  maturity: string
  ccy: string
  counterparty: string
  instrument: string
  tradeType: string
}

export const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: "book",
    header: "Book",
  },
  {
    accessorKey: "tradeId",
    header: "Trade ID",
  },
  {
    accessorKey: "tradeDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Trade Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "maturity",
    header: "Maturity",
  },
  {
    accessorKey: "ccy",
    header: "CCY",
  },
  {
    accessorKey: "counterparty",
    header: "Counterparty",
  },
  {
    accessorKey: "instrument",
    header: "Instrument",
  },
  {
    accessorKey: "notional",
    header: "Notional",
  },
  {
    accessorKey: "tradeStatus",
    header: "Trade Status",
  },
  {
    accessorKey: "desk",
    header: "Desk",
  },
 

]
