"use client"

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout, Layers, Eye, ChevronDown } from 'lucide-react'
import Link from "next/link"

export default function TopNavigation() {
  return (
    <div className="border-b">
      <div className="flex h-14 items-center justify-between px-4 dark text-white">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-2 px-2 py-1 text-sm">
                <Layout className="h-3 w-3" />
                Navigation
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[200px]">
                  <NavigationMenuLink asChild>
                    <Link
                      className="group grid h-auto w-full items-center gap-1 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-gray-900"
                      href="#"
                    >
                      <div className="text-sm font-medium">Dashboard</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View main trading dashboard
                      </div>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link
                      className="group grid h-auto w-full items-center gap-1 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-gray-900"
                      href="#"
                    >
                      <div className="text-sm font-medium">Traders</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Manage trader profiles
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-2 px-2 py-1 text-sm">
                <Layers className="h-3 w-3" />
                Layouts
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[200px]">
                  <NavigationMenuLink asChild>
                    <Link
                      className="group grid h-auto w-full items-center gap-1 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-gray-900"
                      href="#"
                    >
                      <div className="text-sm font-medium">Grid View</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Display data in grid format
                      </div>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link
                      className="group grid h-auto w-full items-center gap-1 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-gray-900"
                      href="#"
                    >
                      <div className="text-sm font-medium">Table View</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Display data in table format
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-2 px-2 py-1 text-sm">
                <Eye className="h-3 w-3" />
                View
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[200px]">
                  <NavigationMenuLink asChild>
                    <Link
                      className="group grid h-auto w-full items-center gap-1 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-gray-900"
                      href="#"
                    >
                      <div className="text-sm font-medium">Customize</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Adjust view settings
                      </div>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link
                      className="group grid h-auto w-full items-center gap-1 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-gray-900"
                      href="#"
                    >
                      <div className="text-sm font-medium">Filters</div>
                      <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Configure data filters
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <Select defaultValue="emma">
          <SelectTrigger className="w-[180px] bg-transparent text-primary-foreground border-primary">
            <SelectValue />
         </SelectTrigger>
          <SelectContent className="bg-black text-white">
            <SelectItem value="emma">Emma Johnson</SelectItem>
            <SelectItem value="john">John Smith</SelectItem>
            <SelectItem value="michael">Michael Brown</SelectItem>
            <SelectItem value="robert">Robert Wilson</SelectItem>
            <SelectItem value="sarah">Sarah Davis</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

