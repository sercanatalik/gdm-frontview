"use client"

import { RiskFilter } from "@/components/filters/risk-filter"
import { MultiSelectDraggable } from "@/components/filters/multi-select-draggable"
import type { Filter } from "@/components/ui/filters"
import { useState, useEffect } from "react"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import { JsonEditor } from 'json-edit-react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { themeBalham } from 'ag-grid-community';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LicenseManager } from 'ag-grid-enterprise';

import { ModuleRegistry,AllCommunityModule } from 'ag-grid-community'; 
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { DatasourceSelector } from "@/components/filters/datasource-selector"
LicenseManager.setLicenseKey('your-license-key-here');

// Register all Community and Enterprise features
ModuleRegistry.registerModules([AllCommunityModule]);

// Register AG Grid license and modules
LicenseManager.setLicenseKey('your-license-key-here')

// Define types
interface RiskData {
  SL1: string
  ytd: number
  mtd: number
  [key: string]: any
}

export default function FinancingWorkspace() {
  const [filters, setFilters] = useState<Filter[]>([])
  const [results, setResults] = useState<RiskData[]>([])
  const [selectedDatasource, setSelectedDatasource] = useState<string>("risk_f_mv")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
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

  const columnDefs = [
    { headerName: "SL1", field: "SL1" },
    { headerName: "YTD", field: "ytd" },
    { headerName: "MTD", field: "mtd" },
  ]

  return (
    <ContentLayout title="Workspace">
      <div className="flex-1 space-y-1 p-0 pt-0">
        <div className="flex justify-between items-center">
      <MultiSelectDraggable
        options={[
          { id: 'SL1', label: 'SL1' },
          { id: 'YTD', label: 'YTD' },
          { id: 'MTD', label: 'MTD' },
        ]}
        value={selectedColumns}
        onChange={setSelectedColumns}
       
      />
          
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
            
          
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
          />
         
        </div>
      </div>
    </ContentLayout>
  )
}

