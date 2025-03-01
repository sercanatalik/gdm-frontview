"use client"

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Stats } from "./components/stats";
import { useState } from "react";
import { Filter, FilterType, FilterOperator } from "@/components/ui/filters";
import { RiskFilter } from "@/components/filters/risk-filter";

export default function FinancingMainPage() {
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);

  const handleDeskChange = (desk: string | null) => {
    setSelectedDesk(desk);
    if (desk) {
      setFilters(prev => [...prev.filter(f => f.type !== FilterType.DESK), {
        id: Date.now().toString(),
        type: FilterType.DESK,
        operator: FilterOperator.IS,
        value: [desk]
      }]);
    } else {
      setFilters(prev => prev.filter(f => f.type !== FilterType.DESK));
    }
  };

  return (
    <ContentLayout title="Dashboard">
      <div className="hidden flex-col md:flex">
        <div className="flex-1 space-y-4 p-0 pt-0">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Financing Frontview</h2>
            <RiskFilter filters={filters} setFilters={setFilters} />
          </div>
          <Stats onDeskChange={handleDeskChange} />
          <div className="flex items-center justify-between space-y-2">
            {JSON.stringify(filters)}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
