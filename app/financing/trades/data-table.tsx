"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Download } from "lucide-react"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  onViewDetails?: (row: TData) => void
}

export function DataTable<TData>({
  columns,
  data,
  onViewDetails,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  const exportToCSV = () => {
    // Get the filtered data
    const filteredData = table.getFilteredRowModel().rows.map(row => {
      const rowData: Record<string, any> = {}
      row.getVisibleCells().forEach(cell => {
        const columnId = cell.column.id
        const value = cell.getValue()
        // Handle null/undefined values
        rowData[columnId] = value ?? ''
      })
      return rowData
    })

    // Get column headers and their IDs
    const headerMap = new Map<string, string>()
    table.getAllColumns()
      .filter(column => column.getIsVisible())
      .forEach(column => {
        const header = column.columnDef.header
        const headerText = typeof header === 'string' 
          ? header 
          : column.id
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        headerMap.set(column.id, headerText)
      })

    // Create CSV content with BOM for Excel compatibility
    const BOM = '\uFEFF'
    const csvRows = []
    
    // Add headers
    const headers = Array.from(headerMap.values())
    csvRows.push(headers.join(','))
    
    // Add data rows
    filteredData.forEach(row => {
      const values = Array.from(headerMap.keys()).map(columnId => {
        const value = row[columnId]
        
        // Format the value for CSV
        if (value === null || value === undefined) {
          return '""'
        }
        
        // Convert to string and escape quotes
        const stringValue = String(value)
          .replace(/"/g, '""') // Escape quotes by doubling them
        
        // Wrap in quotes if contains comma, newline, or quote
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue}"`
        }
        
        return stringValue
      })
      
      csvRows.push(values.join(','))
    })

    // Join rows with newlines and add BOM
    const csvContent = BOM + csvRows.join('\n')
    
    // Create and trigger download
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8'
    })
    
    // Create download link
    const link = document.createElement('a')
    const url = window.URL.createObjectURL(blob)
    
    // Set download attributes
    link.setAttribute('href', url)
    link.setAttribute('download', `trades_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.display = 'none'
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="flex-1 rounded-md border overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onViewDetails ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onViewDetails && onViewDetails(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
