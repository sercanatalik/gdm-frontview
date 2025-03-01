"use client";

import { RiskFilter } from "@/components/filters/risk-filter";
import { Filter } from "@/components/ui/filters";
import { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function FinancingWorkspace() {
  const [filters, setFilters] = useState<Filter[]>([]);

  return (
    <ContentLayout title="Workspace">
      <div className="flex-1 space-y-4 p-0 pt-0">
        <div className="flex justify-end">
          <RiskFilter filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex mx-4">
          {JSON.stringify(filters)}
        </div>
      </div>
    </ContentLayout>
  );
}
