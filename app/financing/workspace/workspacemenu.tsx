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
    label: 'Layouts',
    items: [
      { label: 'Cashout by Desk', action: () => console.log('Undo') },
      { label: 'Cashout by Colleteral', action: () => console.log('Undo') },
      { label: 'Cashout by Counterparty', action: () => console.log('Undo') },
      'separator',
      { label: 'Save Layout', action: () => {
        console.log('Save Layout');
      }},
  
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Zoom In', shortcut: '⌘+', action: () => {
        const currentZoom = parseFloat(document.body.style.zoom) || 1;
        document.body.style.zoom = `${Math.min(currentZoom + 0.1, 2)}`;
      }},
      { label: 'Zoom Out', shortcut: '⌘-', action: () => {
        const currentZoom = parseFloat(document.body.style.zoom) || 1;
        document.body.style.zoom = `${Math.max(currentZoom - 0.1, 0.5)}`;
      }},
      'separator',
      { label: 'Toggle Fullscreen', action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }},
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
