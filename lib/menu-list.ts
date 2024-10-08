import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
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
          icon: LayoutGrid,
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
              label: "Instruments"
            },
            {
              href: "/financing/trades",
              label: "Trades"
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
    // {
    //   groupLabel: "Settings",
    //   menus: [
    //     {
    //       href: "/users",
    //       label: "Users",
    //       active: pathname.includes("/users"),
    //       icon: Users
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
