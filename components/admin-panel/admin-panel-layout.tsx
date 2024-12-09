"use client";

import { cn } from "@/lib/utils";
import { Footer } from "@/components/admin-panel/footer";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";

export default function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { getIsOpenState } = useSidebar();
  const isSidebarOpen = getIsOpenState();

  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          isSidebarOpen ? "lg:ml-72" : "lg:ml-[90px]"
        )}
      >
        {children}
      </main>
    </>
  );
}
