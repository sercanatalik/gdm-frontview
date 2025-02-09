"use client"

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Stats } from "./components/stats";
import { useState } from "react";

export default function FinancingMainPage() {
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null);


  return (
    <ContentLayout title="Dashboard">
      <div className="hidden flex-col md:flex">
        <div className="flex-1 space-y-4 p-0 pt-0">
          <h2 className="text-3xl font-bold tracking-tight">Financing Frontview</h2>
          <Stats onDeskChange={(desk) => setSelectedDesk(desk)} /> 
            <div className="flex items-center justify-between space-y-2">
              
            </div>
        </div>
      </div>
    </ContentLayout>
  );
}
