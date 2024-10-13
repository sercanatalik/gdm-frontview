'use client'

import React, { useState, useEffect } from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "@/components/ui/menubar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Save,FolderOpen,Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from 'lucide-react'

// Define the structure for a menu item
interface MenuItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  action?: () => void;
  icon?: React.ReactNode;
  submenu?: MenuItem[];
}

// Define the structure for a menu
interface Menu {
  label: string;
  items: (MenuItem | 'separator')[];
}

export function WorkspaceMenu({ saveLayout, loadLayout, downloadLayout }: { 
  saveLayout: (layoutName: string) => void,
  loadLayout: (layoutName: string) => void,
  downloadLayout: () => void,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [layouts, setLayouts] = useState<Record<string, any>>({});
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [newLayoutName, setNewLayoutName] = useState('');

  useEffect(() => {
    const savedLayouts = localStorage.getItem('workspaceLayouts');
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    }
  }, []);

  const handleRenameLayout = () => {
    if (selectedLayout && newLayoutName) {
      const updatedLayouts = { ...layouts };
      updatedLayouts[newLayoutName] = updatedLayouts[selectedLayout];
      delete updatedLayouts[selectedLayout];
      setLayouts(updatedLayouts);
      localStorage.setItem('workspaceLayouts', JSON.stringify(updatedLayouts));
      setSelectedLayout(null);
      setNewLayoutName('');
    }
  };

  const handleDeleteLayout = () => {
    if (selectedLayout) {
      const updatedLayouts = { ...layouts };
      delete updatedLayouts[selectedLayout];
      setLayouts(updatedLayouts);
      localStorage.setItem('workspaceLayouts', JSON.stringify(updatedLayouts));
      setSelectedLayout(null);
    }
  };

  // Create the menu items array
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
        { 
          label: 'Default Views',
          submenu: [
            { label: 'Cashout by Counterparty', action: () => console.log('Default View Item 1') },
            { label: 'Cashout by Instrument', action: () => console.log('Default View Item 2') },
          ]
        },
        'separator',
        { label: 'User Defined Views',   
          submenu: [
            ...(() => {
              const savedLayouts = localStorage.getItem('workspaceLayouts');
              if (!savedLayouts) return [];
              
              const parsedLayouts = JSON.parse(savedLayouts);
              
              return Object.keys(parsedLayouts).map((layoutName) => ({
                label: layoutName,
                action: () => loadLayout(layoutName), // Use the loadLayout callback here
                key: `layout-${layoutName}`,
              }));
            })(),
          ]
        },
      
        'separator',
        { 
          label: 'Save Layout', 
          action: () => setIsDialogOpen(true),
          icon: <Save className="h-4 w-4 ml-2" />
        },
        'separator',
        { 
          label: 'Manage Layouts', 
          action: () => setIsManageDialogOpen(true),
          icon: <FolderOpen className="h-4 w-4 ml-2" />
        },
     
  
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


  return (
    <>
      <Menubar className="h-5 min-h-[1rem] items-center">
        {menuItems.map((menu) => (
          <MenubarMenu key={menu.label}>
            <MenubarTrigger className="text-xs px-1.5 py-0.5">{menu.label}</MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item, index) => 
                item === 'separator' ? (
                  <MenubarSeparator key={`${menu.label}-separator-${index}`} />
                ) : 'submenu' in item ? (
                  <MenubarSub key={item.label}>
                    <MenubarSubTrigger className="text-xs px-1.5 py-0.5">{item.label}</MenubarSubTrigger>
                    <MenubarSubContent>
                      {item.submenu?.map((subItem) => (
                        <MenubarItem key={subItem.label} onClick={subItem.action}>
                          {subItem.label}
                        </MenubarItem>
                      ))}
                    </MenubarSubContent>
                  </MenubarSub>
                ) : (
                  <MenubarItem
                    key={item.label}
                    disabled={item.disabled}
                    onClick={item.action}
                    className="text-xs flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <div className="flex items-center">
                      {item.shortcut && <MenubarShortcut className="text-xs mr-2">{item.shortcut}</MenubarShortcut>}
                      {item.icon}
                    </div>
                  </MenubarItem>
                )
              )}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Layout</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for your layout:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder="Layout name"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLayoutName('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => saveLayout(layoutName)}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex justify-between items-center">
              Manage Layouts
              <Button variant="outline" size="sm" onClick={downloadLayout}>
                <Download className="h-4 w-4 mr-2" />
                Download All Layouts
              </Button>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select a layout to rename or delete:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            {Object.keys(layouts).map((layoutName) => (
              <div key={layoutName} className="flex items-center justify-between">
                <span>{layoutName}</span>
                <div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedLayout(layoutName);
                    setNewLayoutName(layoutName);
                  }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                  </Button>
                  <Button variant="outline" size="sm" className="ml-2" onClick={() => {
                    setSelectedLayout(layoutName);
                    handleDeleteLayout();
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {selectedLayout && (
            <div className="mt-4">
              <Input
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="New layout name"
              />
              <div className="mt-2 flex justify-end">
                <Button variant="outline" onClick={handleRenameLayout}>Rename</Button>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedLayout(null);
              setNewLayoutName('');
            }}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
