"use client"
import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet";
import Image from "next/image";
import hsbcLogo from "@/public/hsbc.svg";
import hsbcDarkLogo from "@/public/hsbc-dark.svg";

export function SheetMenu() {
  const { theme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src={theme === 'dark' ? hsbcDarkLogo : hsbcLogo}
                alt="HSBC Logo"
                width={24}
                height={24}
                className="mr-2"
              />  
              <SheetTitle className="font-bold text-lg">GDM Frontview</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
