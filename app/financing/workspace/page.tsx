"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule, ClientSideRowModelModule, GridApi, GridReadyEvent } from 'ag-grid-community'
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise'
import { FileSpreadsheet } from "lucide-react"

import { RiskFilter } from "@/components/filters/risk-filter"
import { DatasourceSelector } from "@/components/filters/datasource-selector"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import { Button } from "@/components/ui/button"
import type { Filter } from "@/components/ui/filters"
import { generateAgGridRowGrouping, generateAgGridValueColumns } from "@/lib/clickhouse-wrap"
import { SaveLayoutButton } from "./SaveLayoutButton"

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
  enableValue?: boolean
  aggFunc?: string
  valueFormatter?: string | ((params: any) => string)
  cellDataType?: string
  valueGetter?: string
  cellRenderer?: (params: any) => any
}

interface WorkspaceState {
  selectedDatasource: string
  columnState: any[]
  timestamp: string
}

const LOCAL_STORAGE_KEY = 'financingWorkspaceState'
const DEFAULT_DATASOURCE = 'risk_f_mv'

export default function FinancingWorkspace() {
  // State management
  const [filters, setFilters] = useState<Filter[]>([])
  const [results, setResults] = useState<RiskData[]>([])
  const [selectedDatasource, setSelectedDatasource] = useState<string>(DEFAULT_DATASOURCE)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [availableColumns, setAvailableColumns] = useState<ColumnOption[]>([])
  const [availableValueColumns, setAvailableValueColumns] = useState<ColumnOption[]>([])
  const [valueColumns, setValueColumns] = useState<ColumnOption[]>([])
  const [searchText, setSearchText] = useState<string>('')

  const gridRef = useRef<AgGridReact>(null)
  const initialColumnState = useRef<any>(null)

  // Grid state management
  const saveGridState = useCallback(() => {
    if (!gridRef.current?.api) return
    
    const columnState = gridRef.current.api.getColumnState()
    const stateToSave: WorkspaceState = {
      selectedDatasource,
      columnState,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave))
    alert('Workspace state saved successfully')
  }, [selectedDatasource])

  const resetGridState = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setSelectedDatasource(DEFAULT_DATASOURCE)
    setValueColumns([])
    
    if (gridRef.current?.api) {
      gridRef.current.api.resetColumnState()
    }
  
    alert('Workspace state reset successfully')
  }, [])

  const loadGridState = useCallback(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!savedState) return
    
    try {
      const parsedState = JSON.parse(savedState) as WorkspaceState
      setSelectedDatasource(parsedState.selectedDatasource)
      
      if (parsedState.columnState) {
        initialColumnState.current = parsedState.columnState
      }
    } catch (error) {
      console.error('Error loading saved state:', error)
    }
  }, [])

  // Data fetching
  const fetchColumns = useCallback(async () => {
    try {
      const response = await fetch(`/api/tables?table=${selectedDatasource}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch columns: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      const groupableColumns = generateAgGridRowGrouping(data)
      const valueColumnsData = generateAgGridValueColumns(data)
      
      // Ensure unique columns by field name
      const uniqueGroupableColumns = Array.from(
        new Map(groupableColumns.map(col => [col.field, col])).values()
      )
      
      const uniqueValueColumnsData = Array.from(
        new Map(valueColumnsData.map(col => [col.field, col])).values()
      )
      
      setAvailableColumns(uniqueGroupableColumns.map(col => ({
        id: col.field,
        label: col.field,
        key: col.field
      })))

      setAvailableValueColumns(uniqueValueColumnsData.map(col => ({
        id: col.field,
        label: col.field,
        key: col.field
      })))

      setValueColumns(uniqueValueColumnsData.map(col => ({
        id: col.field,
        label: col.field,
        key: col.field,
        enableValue: col.enableValue,
        aggFunc: col.aggFunc,
        cellDataType: col.cellDataType,
        valueFormatter: col.valueFormatter,
      })))
      
    } catch (error) {
      console.error("Error fetching columns:", error)
      setAvailableColumns([])
      setValueColumns([])
    }
  }, [selectedDatasource])

  const fetchRiskData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/tables/data/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  }, [filters, selectedDatasource])

  // Cell rendering and formatting
  const formatCellValue = useCallback((value: any): string => {
    if (typeof value === 'number') {
      return Math.round(value).toLocaleString()
    }
    return value || ''
  }, [])

  const renderCell = useCallback((params: any) => {
    if (typeof params.value !== 'number') {
      return params.value || ''
    }
    
    const isNegative = params.value < 0
    return (
      <span style={{ color: isNegative ? 'red' : 'inherit' }}>
        {Math.round(params.value).toLocaleString()}
      </span>
    )
  }, [])

  // Grid configuration
  const columnDefs = useMemo(() => {
    return valueColumns.map(col => ({
      headerName: col.label,
      field: col.id,
      enableValue: true,
      aggFunc: col.aggFunc || 'sum',
      hide: false,
      valueFormatter: (params: any) => formatCellValue(params.value),
      cellRenderer: renderCell,
      cellDataType: col.cellDataType || 'number',
      enableRowGroup: true,
    }))
  }, [valueColumns, formatCellValue, renderCell])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    enableRowGroup: true,
    filterParams: {
      filterOptions: ['contains', 'notContains', 'equals', 'notEqual', 'startsWith', 'endsWith'],
      defaultOption: 'contains',
    },
  }), [])

  // Grid event handlers
  const onGridReady = useCallback((event: GridReadyEvent) => {
    if (!event.api) return
    
    if (initialColumnState.current) {
      event.api.applyColumnState({
        state: initialColumnState.current,
        applyOrder: true
      })
    } else {
      event.api.resetColumnState()
    }
    
    // Defer column sizing to avoid blocking the main thread
    requestAnimationFrame(() => {
      event.api.sizeColumnsToFit()
      // Use requestIdleCallback for non-critical operations when browser is idle
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          event.api.autoSizeAllColumns()
        })
      } else {
        // Fallback with longer timeout
        setTimeout(() => {
          event.api.autoSizeAllColumns()
        }, 250)
      }
    })
  }, [])

  const autoSizeColumns = useCallback(() => {
    if (!gridRef.current?.api) return
    
    // Defer column sizing to avoid blocking the main thread
    requestAnimationFrame(() => {
      gridRef.current?.api?.sizeColumnsToFit()
      // Use requestIdleCallback for non-critical operations
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          gridRef.current?.api?.autoSizeAllColumns()
        })
      } else {
        // Fallback with longer timeout
        setTimeout(() => {
          gridRef.current?.api?.autoSizeAllColumns()
        }, 250)
      }
    })
  }, [])

  const onRowGroupOpened = useCallback(() => {
    autoSizeColumns()
  }, [autoSizeColumns])

  const onRowDataUpdated = useCallback(() => {
    autoSizeColumns()
  }, [autoSizeColumns])

  const onExportToExcel = useCallback(() => {
    if (!gridRef.current?.api) return
    
    const params = {
      fileName: `${selectedDatasource}_export_${new Date().toISOString().split('T')[0]}.xlsx`,
      processCellCallback: (params: any) => {
        return typeof params.value === 'number' ? Math.round(params.value) : params.value
      }
    }
    
    gridRef.current.api.exportDataAsExcel(params)
  }, [selectedDatasource])

  // Add search functionality
  const onSearchTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    
    if (!gridRef.current?.api) return;
    
    // Force the grid to refresh with our new filter value
    gridRef.current.api.onFilterChanged();
  }, []);

  // Create an external filter function
  const isExternalFilterPresent = useCallback(() => {
    return searchText !== '';
  }, [searchText]);

  // Filter function that checks if any cell in the row contains the search text
  const doesExternalFilterPass = useCallback((node: any) => {
    if (searchText === '') return true;
    
    const searchTextLower = searchText.toLowerCase();
    const rowData = node.data;
    
    // Skip if no data (like group rows)
    if (!rowData) return false;
    
    // Check all fields in the row
    return Object.keys(rowData).some(key => {
      const value = rowData[key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchTextLower);
    });
  }, [searchText]);

  // Effects
  useEffect(() => {
    loadGridState()
  }, [loadGridState])

  useEffect(() => {
    fetchColumns()
  }, [fetchColumns])

  useEffect(() => {
    fetchRiskData()
  }, [fetchRiskData])

  useEffect(() => {
    if (!gridRef.current?.api) return
    // Defer to avoid blocking the main thread
    requestAnimationFrame(() => {
      gridRef.current?.api?.sizeColumnsToFit()
    })
  }, [])

  return (
    <ContentLayout title="Workspace">
      <div className="flex-1 space-y-1 p-0 pt-0">
        <div className="flex justify-between items-start">
          <div className="w-full max-w-sm space-y-0 p-0">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={onSearchTextChange}
              className="px-3 py-1 border rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <RiskFilter 
              filters={filters} 
              setFilters={setFilters} 
              tableName='risk_f_mv' 
            />
            <Button 
              variant="outline"
              size="sm"
              className="transition h-6 border-none text-xs hover:bg-transparent"
              onClick={onExportToExcel}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
            <SaveLayoutButton onSave={saveGridState} onReset={resetGridState} />
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
            rowGroupPanelShow={"always"}
            ref={gridRef}
            rowData={results}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loading={isLoading}
            animateRows={true}
            onRowDataUpdated={onRowDataUpdated}
            onGridReady={onGridReady}
            onRowGroupOpened={onRowGroupOpened}
            sideBar={true}
            isExternalFilterPresent={isExternalFilterPresent}
            doesExternalFilterPass={doesExternalFilterPass}
          />
        </div>
      </div>
    </ContentLayout>
  )
}

