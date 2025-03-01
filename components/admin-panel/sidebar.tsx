"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Menu } from "@/components/admin-panel/menu"
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/hooks/use-sidebar"
import { cn } from "@/lib/utils"
import Image from "next/image"
import hsbcLogo from "@/public/hsbc.svg"
import hsbcDarkLogo from "@/public/hsbc-dark.svg"
import { useTheme } from "next-themes"

export function Sidebar() {
  const sidebar = useSidebar()
  const [isOpen, setIsOpen] = useState(sidebar.isOpen)
  const { theme } = useTheme()
  useEffect(() => {
    setIsOpen(sidebar.isOpen)
  }, [sidebar.isOpen])

  if (isOpen === undefined) return null

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        isOpen === false ? "w-[90px]" : "w-72",
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={sidebar.toggleOpen} />
      <div
        onMouseEnter={() => sidebar.setIsHover(true)}
        onMouseLeave={() => sidebar.setIsHover(false)}
        className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800"
      >
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            isOpen === false ? "translate-x-1" : "translate-x-0",
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={theme === "dark" ? hsbcDarkLogo : hsbcLogo}
              alt="HSBC Logo"
              width={36}
              height={36}
              className="mr-2"
              priority
            />

            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                isOpen === false ? "-translate-x-96 opacity-0 hidden" : "translate-x-0 opacity-100",
              )}
            >
              GDM Frontview
            </h1>
          </Link>
        </Button>
        <Menu isOpen={isOpen} />
      </div>
    </aside>
  )
}

