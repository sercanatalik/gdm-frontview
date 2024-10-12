"use client"
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { usePathname } from 'next/navigation'

export default function FinancingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()
  const showSidebar = pathname !== '/financing/workspace'

  return showSidebar ? (
    <AdminPanelLayout>{children}</AdminPanelLayout>
  ) : (
    <>{children}</>
  );
}
