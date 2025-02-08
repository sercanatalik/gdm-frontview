import {
  Tag,
  Users,
  Settings,
  Bookmark,ChartArea,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Radical,
  BookOpenText,Workflow,LayoutPanelTop,ShoppingBasket
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
  icon?: LucideIcon;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Financing",
      menus: [
        {
          href: "/financing/dashboard",
          label: "Dashboard",
          active: pathname.includes("/financing/dashboard"),
          icon: ChartArea,
          submenus: []
        },
        {
          href: "/financing/workspace",
          label: "Workspace",
          active: pathname.includes("/financing/workspace"),
          icon: LayoutPanelTop,
        
        }
      ]
    },
    // {
    //   groupLabel: "Markets",
    //   menus: [
    //     {
    //       href: "/markets/bonds",
    //       label: "Bonds",
    //       active: pathname.includes("/markets/bonds"),
    //       icon: Radical,
    //       submenus: []
    //     },
    
    //   ]
    // },
    
    // {
    //   groupLabel: "Refdata",
    //   menus: [
    //     {
    //       href: "/financing/overrides",
    //       label: "Instruments",
    //       active: pathname.includes("/financing/overrides"),
    //       icon: SquarePen,
         
    //     },
    //     {
    //       href: "/baskets/overrides",
    //       label: "Custom Baskets",
    //       active: pathname.includes("/baskets/overrides"),
    //       icon: ShoppingBasket,
         
    //     },
      
    //   ]
    // },
    // {
    //   groupLabel: "Settings",
    //   menus: [
    //     {
    //       href: "/swagger",
    //       label: "API Docs",
    //       active: pathname.includes("/swagger"),
    //       icon: BookOpenText
    //     },
    //     {
    //       href: "/account",
    //       label: "Account",
    //       active: pathname.includes("/account"),
    //       icon: Settings
    //     }
    //   ]
    // }
  ];
}
