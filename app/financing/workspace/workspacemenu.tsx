import React from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

// Define the structure for a menu item
interface MenuItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  action?: () => void;
}

// Define the structure for a menu
interface Menu {
  label: string;
  items: (MenuItem | 'separator')[];
}

// Create the menu items dictionary
const menuItems: Menu[] = [
  {
    label: 'Navigation',
    items: [
      { label: 'Home', shortcut: '⌘H', action: () => window.location.href = '/' },
      { label: 'Dashboard', shortcut: '⌘O', action: () => window.location.href = '/financing/dashboard' },
      { label: 'Trades', disabled: true ,action: () => window.location.href = '/financing/trades'},
      { label: 'Instruments', disabled: true ,action: () => window.location.href = '/financing/instruments'},
      { label: 'Pricing', disabled: true ,action: () => window.location.href = '/financing/pricing'},
      
      'separator',
      { label: 'Exit', action: () => window.location.href = '/'  },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z', action: () => console.log('Undo') },
      { label: 'Redo', shortcut: '⇧⌘Z', action: () => console.log('Redo') },
      'separator',
      { label: 'Cut', shortcut: '⌘X', action: () => console.log('Cut') },
      { label: 'Copy', shortcut: '⌘C', action: () => console.log('Copy') },
      { label: 'Paste', shortcut: '⌘V', action: () => console.log('Paste') },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Zoom In', shortcut: '⌘+', action: () => console.log('Zoom in') },
      { label: 'Zoom Out', shortcut: '⌘-', action: () => console.log('Zoom out') },
      'separator',
      { label: 'Toggle Fullscreen', action: () => console.log('Toggle fullscreen') },
    ],
  },
];

export function WorkspaceMenu() {
  return (
    <Menubar className="h-5 min-h-[1rem] items-center">
      {menuItems.map((menu) => (
        <MenubarMenu key={menu.label}>
          <MenubarTrigger className="text-xs px-1.5 py-0.5">{menu.label}</MenubarTrigger>
          <MenubarContent>
            {menu.items.map((item, index) => 
              item === 'separator' ? (
                <MenubarSeparator key={`${menu.label}-separator-${index}`} />
              ) : (
                <MenubarItem
                  key={item.label}
                  disabled={item.disabled}
                  onClick={item.action}
                  className="text-xs"
                >
                  {item.label}
                  {item.shortcut && <MenubarShortcut className="text-xs ml-auto">{item.shortcut}</MenubarShortcut>}
                </MenubarItem>
              )
            )}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
