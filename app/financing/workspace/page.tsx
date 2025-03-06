"use client"

import { useState, useEffect, useMemo } from "react"
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule, ClientSideRowModelModule, GridApi } from 'ag-grid-community'
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise'
import { Columns } from "lucide-react"

import { RiskFilter } from "@/components/filters/risk-filter"
import { MultiSelectDraggable } from "@/components/filters/multi-select-draggable"
import { DatasourceSelector } from "@/components/filters/datasource-selector"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import { Button } from "@/components/ui/button"
import type { Filter } from "@/components/ui/filters"
import { generateAgGridRowGrouping } from "@/lib/clickhouse-wrap"

// Register AG Grid modules once
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule, ClientSideRowModelModule])
LicenseManager.setLicenseKey('')

// Define types
interface RiskData {
  SL1: string
  ytd: number
  mtd: number
  [key: string]: any
}

interface ColumnOption {
  id: string
  label: string
  key?: string
}

export default function FinancingWorkspace() {
  // State management
  const [filters, setFilters] = useState<Filter[]>([])
  const [results, setResults] = useState<RiskData[]>([])
  const [selectedDatasource, setSelectedDatasource] = useState<string>("risk_f_mv")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [availableColumns, setAvailableColumns] = useState<ColumnOption[]>([])
  const [api, setApi] = useState<GridApi | null>(null)
  
  // Fetch available columns when datasource changes
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch(`/api/tables?table=${selectedDatasource}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch columns: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Get groupable columns with AG Grid format
        const groupableColumns = generateAgGridRowGrouping(data)
        
        // Set available columns for the multi-select
        setAvailableColumns(groupableColumns.map(col => ({
          id: col.field,
          label: col.field,
          key: col.field
        })))
        
        // Reset selected columns when datasource changes
        setSelectedColumns([])
      } catch (error) {
        console.error("Error fetching columns:", error)
        setAvailableColumns([])
      }
    }

    fetchColumns()
  }, [selectedDatasource])

  useEffect(() => {
    if (!api) return;
    
    // Set row groups
    api.setRowGroupColumns(selectedColumns);
    api.sizeColumnsToFit();
   
  }, [selectedColumns]);
  
  // Fetch data when filters or datasource changes
  useEffect(() => {
    const fetchRiskData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch("/api/tables/data/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filter: filters, tableName: selectedDatasource }),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }
        
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Error fetching risk data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRiskData()
  }, [filters, selectedDatasource])

  // Memoize column definitions to prevent unnecessary re-renders
  const columnDefs = useMemo(() => [
    { headerName: "SL1", field: "SL1" },
    { headerName: "YTD", field: "ytd" },
    { headerName: "MTD", field: "mtd" },
    
    ...selectedColumns.map(colId => ({
      field: colId,
      rowGroup: true,
      enableRowGroup: true,
      hide: true
    }))
  ], [selectedColumns])

  // Memoize default column definitions
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), [])

  return (
    <ContentLayout title="Workspace">
      <div className="flex-1 space-y-1 p-0 pt-0">
        <div className="flex justify-between items-start">
          <div className="w-full max-w-sm space-y-0 p-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Columns className="h-4 w-4" />
              </Button>
              <MultiSelectDraggable
                options={availableColumns}
                value={selectedColumns}
                onChange={setSelectedColumns}
                className="text-xs"
                placeholder="Select grouping columns"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RiskFilter 
              filters={filters} 
              setFilters={setFilters} 
              tableName='risk_f_mv' 
            />
            <DatasourceSelector 
              value={selectedDatasource} 
              onValueChange={setSelectedDatasource} 
            />
          </div>
        </div>
        
        {error && (
          <div className="mx-1 p-1 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}
        
        <div className="w-full h-[90vh] ag-theme-balham">
          <AgGridReact
            rowData={results}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loading={isLoading}
            animateRows={true}
            
            onRowDataUpdated={params => {
              params.api.autoSizeAllColumns();
            }}
            onGridReady={params => {
              setApi(params.api);
              setTimeout(() => {
                params.api.autoSizeAllColumns();
              }, 0);
            }}
          />
        </div>
      </div>
    </ContentLayout>
  )
}

