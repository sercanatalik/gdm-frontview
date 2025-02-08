"use client"
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { useEffect, useState } from 'react';

export default function FinancingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
