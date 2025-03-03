"use client"

import { RiskFilter } from "@/components/filters/risk-filter"
import type { Filter } from "@/components/ui/filters"
import { useState, useEffect } from "react"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import { JsonEditor } from 'json-edit-react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { themeBalham } from 'ag-grid-community';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

import { LicenseManager } from 'ag-grid-enterprise';

import { ModuleRegistry,AllCommunityModule } from 'ag-grid-community'; 
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { DatasourceSelector } from "@/components/filters/datasource-selector"
LicenseManager.setLicenseKey('your-license-key-here');

// Register all Community and Enterprise features
ModuleRegistry.registerModules([AllCommunityModule]);


export default function FinancingWorkspace() {
  const [filters, setFilters] = useState<Filter[]>([])
  const [results, setResults] = useState<any[]>([])
  
  const [selectedDatasource, setSelectedDatasource] = useState<string>("risk_f_mv")


  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const response = await fetch("/api/tables/data/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filter: filters, tableName: selectedDatasource }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch risk data")
        }
        const data = await response.json()
        setResults(data)
        // Handle the response data as needed
      } catch (error) {
        console.error("Error fetching risk data:", error)
      }
    }

      fetchRiskData()
    

  }, [filters,selectedDatasource])

  const colDefs = [
    { headerName: "SL1", field: "SL1" },
    { headerName: "YTD", field: "ytd" },
    { headerName: "MTD", field: "mtd" },
  
  ]

  return (
    <ContentLayout title="Workspace">
      <div className="flex-1 space-y-4 p-0 pt-0">
        <div className="flex justify-end items-center gap-">
          <RiskFilter filters={filters} setFilters={setFilters} tableName='risk_f_mv' />
          <DatasourceSelector 
            value={selectedDatasource} 
            onValueChange={setSelectedDatasource} 
          />
        </div>
        <div className="flex mx-4">
            <div className="w-full h-[100vh]">
                <AgGridReact
                    rowData={results}
                    columnDefs={colDefs}
                    theme={themeBalham}
                   
                />
            </div>
        </div>

        <div className="flex mx-4">
          <JsonEditor data={filters} ></JsonEditor>
          <JsonEditor
            data={Array.isArray(results) ? results.slice(0, 10) : results}
          ></JsonEditor>
        </div>
      </div>
    </ContentLayout>
  )
}

