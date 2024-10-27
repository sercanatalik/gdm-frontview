import {
  Tag,
  Users,
  Settings,
  Bookmark,ChartArea,
  SquarePen,
  LayoutGrid,
  LucideIcon,
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
      groupLabel: "",
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
          submenus: []
        }
      ]
    },
    
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Overrides",
          active: pathname.includes("/instruments"),
          icon: SquarePen,
          submenus: [
            {
              href: "/financing/instruments",
              label: "Instruments",
              icon: ShoppingBasket
            },
            {
              href: "/financing/overrides",
              label: "Overrides",
              icon: ShoppingBasket
            },
            {
              href: "/etf",
              label: "Index",
              icon: ShoppingBasket
            }
          ]
        },
        // {
        //   href: "/categories",
        //   label: "Categories",
        //   active: pathname.includes("/categories"),
        //   icon: Bookmark
        // },
        // {
        //   href: "/tags",
        //   label: "Tags",
        //   active: pathname.includes("/tags"),
        //   icon: Tag
        // }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/swagger",
          label: "API Docs",
          active: pathname.includes("/swagger"),
          icon: BookOpenText
        },
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: Settings
        }
      ]
    }
  ];
}
