"use client"
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ETFProvider } from './components/etf-provider'
import { ETFList } from "./components/etf-list";

export default function FinancingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPanelLayout >
      <ETFProvider>
        <ETFList />
      </ETFProvider>
    </AdminPanelLayout>
  ) 
}
