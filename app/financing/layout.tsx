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

  // Force client-side rendering to avoid hydration mismatch
  return (
    <>
      {showSidebar ? (
        <AdminPanelLayout>{children}</AdminPanelLayout>
      ) : (
        children
      )}
    </>
  );
}
