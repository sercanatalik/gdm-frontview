"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community'
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise'
import { FileSpreadsheet, Calendar } from "lucide-react"
import { format } from "date-fns"

import { ContentLayout } from "@/components/admin-panel/content-layout"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"

// Register AG Grid modules once
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule, ClientSideRowModelModule])
LicenseManager.setLicenseKey('')

interface NDFFixing {
  asOfDate: string
  snapId: string | null
  tradeId: string | null
  fixingDt: string
  paymentDt: string
  notional: number | null
  ccy: string | null
  hmsBook: string | null
  region: string | null
  updatedAt: string
  id: string
}

export default function NDFPage() {
  const gridRef = useRef<AgGridReact>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<NDFFixing[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  })

  // Helper function to safely format dates
  const safeDateFormat = (dateString: string | null | undefined, formatStr: string = 'yyyy-MM-dd') => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? '' : format(date, formatStr)
    } catch {
      return ''
    }
  }

  // Column Definitions
  const columnDefs = useMemo(() => [
    { 
      field: 'fixingDt', 
      headerName: 'Fixing Date',
      valueFormatter: (params: any) => safeDateFormat(params.value),
      filter: 'agDateColumnFilter',
      sortable: true,
      enableRowGroup: true,
      rowGroup: true,
      comparator: (valueA: string, valueB: string) => {
        const dateA = valueA ? new Date(valueA).getTime() : 0
        const dateB = valueB ? new Date(valueB).getTime() : 0
        return dateA - dateB
      }
    },
    { 
      field: 'notional', 
      headerName: 'Notional',
      valueFormatter: (params: any) => params.value?.toLocaleString() || '',
      filter: 'agNumberColumnFilter',
      sortable: true,
      aggFunc: 'sum',
    },
    { field: 'ccy', headerName: 'CCY', filter: true, sortable: true },
    { field: 'hmsBook', headerName: 'HMS Book', filter: true, sortable: true },
    { field: 'region', headerName: 'Region', filter: true, sortable: true },
    { 
      field: 'updatedAt', 
      headerName: 'Last Updated',
      valueFormatter: (params: any) => safeDateFormat(params.value, 'yyyy-MM-dd HH:mm:ss'),
      filter: 'agDateColumnFilter',
      sortable: true,
      comparator: (valueA: string, valueB: string) => {
        const dateA = valueA ? new Date(valueA).getTime() : 0
        const dateB = valueB ? new Date(valueB).getTime() : 0
        return dateA - dateB
      }
    }
  ], [])

  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    filter: true,
    floatingFilter: true,
    sortable: true,
  }), [])

  // Fetch data when date range changes
  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.from || !dateRange?.to) return
      
      setIsLoading(true)
      
      try {
        const response = await fetch("/api/tables/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            tableName: "ndf_fixing_f"
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching NDF fixing data:", error)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  const onGridReady = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.sizeColumnsToFit()
    }
  }, [])

  const onExportClick = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv()
  }, [])

  return (
    <ContentLayout title="NDF Fixing Data">
      <div className="flex flex-col space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
         
          </div>
          <Button onClick={onExportClick}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
        
        <div className="w-full h-[calc(100vh-200px)] ag-theme-balham">
          <AgGridReact
            ref={gridRef}
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loading={isLoading}
            animateRows={true}
            onGridReady={onGridReady}
            suppressExcelExport={true}
            suppressCsvExport={false}
    
            enableCellTextSelection={true}
            pagination={true}
            paginationPageSize={100}
          />
        </div>
      </div>
    </ContentLayout>
  )
}
