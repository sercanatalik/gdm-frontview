"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule, ClientSideRowModelModule, GridApi, GridReadyEvent } from 'ag-grid-community'
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise'
import { Columns, FileSpreadsheet } from "lucide-react"

import { RiskFilter } from "@/components/filters/risk-filter"
import { MultiSelectDraggable } from "@/components/filters/multi-select-draggable"
import { DatasourceSelector } from "@/components/filters/datasource-selector"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import { Button } from "@/components/ui/button"
import type { Filter } from "@/components/ui/filters"
import { generateAgGridRowGrouping, generateAgGridValueColumns } from "@/lib/clickhouse-wrap"

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
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [selectedValueColumns, setSelectedValueColumns] = useState<string[]>([])
  const [availableColumns, setAvailableColumns] = useState<ColumnOption[]>([])
  const [availableValueColumns, setAvailableValueColumns] = useState<ColumnOption[]>([])
  const [valueColumns, setValueColumns] = useState<ColumnOption[]>([])

  // Properly type the grid reference
  const gridRef = useRef<AgGridReact>(null)
  
  // Fetch available columns when datasource changes
  const fetchColumns = useCallback(async () => {
    try {
      const response = await fetch(`/api/tables?table=${selectedDatasource}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch columns: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Get groupable columns with AG Grid format
      const groupableColumns = generateAgGridRowGrouping(data)
      const valueColumnsData = generateAgGridValueColumns(data)
      
      // Set available columns for the multi-select
      setAvailableColumns(groupableColumns.map(col => ({
        id: col.field,
        label: col.field,
        key: col.field
      })))

      setAvailableValueColumns(valueColumnsData.map(col => ({
        id: col.field,
        label: col.field,
        key: col.field
      })))

      // Set value columns
      setValueColumns(valueColumnsData.map(col => ({
        id: col.field,
        label: col.field,
        key: col.field,
        enableValue: col.enableValue,
        aggFunc: col.aggFunc,
        cellDataType: col.cellDataType,
        valueFormatter: col.valueFormatter,
      })))
      
      // Reset selected columns when datasource changes
      setSelectedColumns([])
    } catch (error) {
      console.error("Error fetching columns:", error)
      setAvailableColumns([])
      setValueColumns([])
    }
  }, [selectedDatasource])

  useEffect(() => {
    fetchColumns()
  }, [fetchColumns])

  // Update row groups when selected columns change
  useEffect(() => {
    if (!gridRef.current?.api) return;
    
    gridRef.current.api.setRowGroupColumns(selectedColumns);
    gridRef.current.api.sizeColumnsToFit();
  }, [selectedColumns]);
  
  // Update value columns visibility when selectedValueColumns changes
  useEffect(() => {
    if (!gridRef.current?.api) return;
    
    // Get all column definitions
    const columnDefs = gridRef.current.api.getColumnDefs();
    if (!columnDefs) return;
    
    // Update column visibility based on selectedValueColumns
    const updatedColumnDefs = columnDefs.map((colDef: any) => {
      // If the column is in selectedValueColumns, make it visible
      if (selectedValueColumns.includes(colDef.field)) {
        return { ...colDef, hide: false };
      }
      // For value columns not selected, hide them
      if (colDef.enableValue && !colDef.rowGroup) {
        return { ...colDef, hide: true };
      }
      // Keep other columns as they are
      return colDef;
    });

    gridRef.current!.api.setGridOption("columnDefs", updatedColumnDefs);

    // Apply the updated column definitions
    gridRef.current?.api?.sizeColumnsToFit();
  }, [selectedValueColumns]);
  
  // Fetch data when filters or datasource changes
  const fetchRiskData = useCallback(async () => {
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
  }, [filters, selectedDatasource])

  useEffect(() => {
    fetchRiskData()
  }, [fetchRiskData])



  // Memoize column definitions to prevent unnecessary re-renders
  const columnDefs = useMemo(() => {
    // Create base columns from value columns
    const baseColumns = valueColumns.map(col => ({
      headerName: col.label,
      field: col.id,
      enableValue: true,
      aggFunc: col.aggFunc || 'sum',
      hide: !selectedValueColumns.includes(col.id),
      valueFormatter: (params: any) => {
        // Format numbers with zero decimals, leave strings unchanged
        if (typeof params.value === 'number') {
          return Math.round(params.value).toLocaleString();
        }
        return params.value || '';
      },
      cellRenderer: (params: any) => { 
        // Format as currency and apply red color to negative values
        if (typeof params.value !== 'number') {
          return params.value || '';
        }
        
        const isNegative = params.value < 0;
        return (
          <span style={{ color: isNegative ? 'red' : 'inherit' }}>
            {Math.round(params.value).toLocaleString()}
          </span>
        );
      },
      cellDataType: col.cellDataType || 'number',
    }));
    
    // Add grouping columns
    const groupColumns = selectedColumns.map(colId => ({
      field: colId,
      rowGroup: true,
      enableRowGroup: true,
      hide: true
    }));
    
    // Sort the baseColumns to match the order in selectedValueColumns
    const orderedBaseColumns = [...baseColumns].sort((a, b) => {
      const aIndex = selectedValueColumns.indexOf(a.field);
      const bIndex = selectedValueColumns.indexOf(b.field);
      
      // If column is not in selectedValueColumns, put it at the end
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      // Otherwise sort by the order in selectedValueColumns
      return aIndex - bIndex;
    });
    
    return [...orderedBaseColumns, ...groupColumns];
  }, [selectedColumns, valueColumns, selectedValueColumns]);

  // Memoize default column definitions
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), [])

  // Grid ready handler
  const onGridReady = useCallback((event: GridReadyEvent) => {
    if (!event.api) return;
    
    event.api.resetColumnState();
    event.api.sizeColumnsToFit();
    event.api.autoSizeAllColumns();
  }, []);

  // Row data updated handler
  const onRowDataUpdated = useCallback((params: { api: GridApi }) => {
    if (!params.api) return;
    
    params.api.sizeColumnsToFit();
  }, []);

  const onColumnVisible = useCallback((state: any) => {
    if (state.column && state.column.colDef && state.column.colDef.enableRowGroup === undefined) {
      const fieldName = state.column.colDef.field;
      if (fieldName && !selectedValueColumns.includes(fieldName)) {
        setSelectedValueColumns(prev => [...prev, fieldName]);
      }
    }
    console.log('Grid state changed:', state);
    gridRef.current?.api?.sizeColumnsToFit();
  }, [selectedValueColumns]);

  // Add export to Excel function
  const onExportToExcel = useCallback(() => {
    if (!gridRef.current?.api) return;
    
    const params = {
      fileName: `${selectedDatasource}_export_${new Date().toISOString().split('T')[0]}.xlsx`,
      processCellCallback: (params: any) => {
        // Format numbers without decimals for Excel
        if (typeof params.value === 'number') {
          return Math.round(params.value);
        }
        return params.value;
      }
    };
    
    gridRef.current.api.exportDataAsExcel(params);
  }, [selectedDatasource]);

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
                className="text-xs w-full"
                placeholder="Select grouping columns"
              />
                <MultiSelectDraggable
                options={availableValueColumns}
                value={selectedValueColumns}
                onChange={setSelectedValueColumns}
                className="text-xs w-full"
                placeholder="Select Value columns"
              />
            </div>
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
            ref={gridRef}
            rowData={results}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loading={isLoading}
            animateRows={true}
            onRowDataUpdated={onRowDataUpdated}
            onGridReady={onGridReady}
            sideBar={true}
            // onGridColumnsChanged={onGridColumnsChanged}
            onColumnVisible={onColumnVisible}
          />
        </div>
      </div>
    </ContentLayout>
  )
}

