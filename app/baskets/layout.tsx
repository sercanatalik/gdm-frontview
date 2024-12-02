"use client"
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";

export default function FinancingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  

  // Force client-side rendering to avoid hydration mismatch
  return (
    <>
      
        <AdminPanelLayout>{children}</AdminPanelLayout>
    
    </>
  );
}
