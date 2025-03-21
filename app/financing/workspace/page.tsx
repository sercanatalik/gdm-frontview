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

export default function FinancingWorkspace() {
  // State management
  const [filters, setFilters] = useState<Filter[]>([])
  const [results, setResults] = useState<RiskData[]>([])
  const [selectedDatasource, setSelectedDatasource] = useState<string>("risk_f_mv")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [availableColumns, setAvailableColumns] = useState<ColumnOption[]>([])
  const [availableValueColumns, setAvailableValueColumns] = useState<ColumnOption[]>([])
  const [valueColumns, setValueColumns] = useState<ColumnOption[]>([])

  const gridRef = useRef<AgGridReact>(null)
  const initialColumnState = useRef<any>(null);

  // Save grid state to localStorage
  const saveGridState = useCallback(() => {
    if (!gridRef.current?.api) return;
    
    const columnState = gridRef.current.api.getColumnState();
    const stateToSave = {
      selectedDatasource,
      columnState,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('financingWorkspaceState', JSON.stringify(stateToSave));
    alert('Workspace state saved successfully');
  }, [selectedDatasource]);

  const resetGridState = useCallback(() => {
    localStorage.removeItem('financingWorkspaceState');
    setSelectedDatasource("risk_f_mv");
    setValueColumns([]);
  
    alert('Workspace state reset successfully');
  }, []);

  // Load grid state from localStorage
  const loadGridState = useCallback(() => {
    const savedState = localStorage.getItem('financingWorkspaceState');
    if (!savedState) return;
    
    try {
      const parsedState = JSON.parse(savedState);
      setSelectedDatasource(parsedState.selectedDatasource);
      
      if (parsedState.columnState) {
        initialColumnState.current = parsedState.columnState;
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }, []);

  // Load saved state on initial render
  useEffect(() => {
    loadGridState();
  }, [loadGridState]);

  // Fetch available columns when datasource changes
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

  // Fetch data when filters or datasource changes
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

  // Effect hooks for data fetching and grid updates
  useEffect(() => {
    fetchColumns()
  }, [fetchColumns])

  useEffect(() => {
    fetchRiskData()
  }, [fetchRiskData])

  useEffect(() => {
    if (!gridRef.current?.api) return;
    gridRef.current.api.sizeColumnsToFit();
  }, []);

  // Format and render cell values
  const formatCellValue = useCallback((value: any): string => {
    if (typeof value === 'number') {
      return Math.round(value).toLocaleString();
    }
    return value || '';
  }, []);

  const renderCell = useCallback((params: any) => {
    if (typeof params.value !== 'number') {
      return params.value || '';
    }
    
    const isNegative = params.value < 0;
    return (
      <span style={{ color: isNegative ? 'red' : 'inherit' }}>
        {Math.round(params.value).toLocaleString()}
      </span>
    );
  }, []);

  // Memoized column definitions
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
    }));
  }, [valueColumns, formatCellValue, renderCell]);

  // Grid event handlers
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    // rowDrag: true,
    enableRowGroup: true,
  }), []);

  const onGridReady = useCallback((event: GridReadyEvent) => {
    if (!event.api) return;
    
    if (initialColumnState.current) {
      event.api.applyColumnState({
        state: initialColumnState.current,
        applyOrder: true
      });
    } else {
      event.api.resetColumnState();
    }
    
    // Auto-size all columns
    event.api.sizeColumnsToFit();
    setTimeout(() => {
      event.api.autoSizeAllColumns();
    }, 100);
  }, []);

  const onRowDataUpdated = useCallback((params: { api: GridApi }) => {
    if (!params.api) return;
    
    // Auto-size all columns when data updates
    params.api.sizeColumnsToFit();
    setTimeout(() => {
      params.api.autoSizeAllColumns();
    }, 10);
  }, []);

  const onExportToExcel = useCallback(() => {
    if (!gridRef.current?.api) return;
    
    const params = {
      fileName: `${selectedDatasource}_export_${new Date().toISOString().split('T')[0]}.xlsx`,
      processCellCallback: (params: any) => {
        return typeof params.value === 'number' ? Math.round(params.value) : params.value;
      }
    };
    
    gridRef.current.api.exportDataAsExcel(params);
  }, [selectedDatasource]);

  return (
    <ContentLayout title="Workspace">
      <div className="flex-1 space-y-1 p-0 pt-0">
        <div className="flex justify-between items-start">
          <div className="w-full max-w-sm space-y-0 p-0">
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
            sideBar={true}
          />
        </div>
      </div>
    </ContentLayout>
  )
}

