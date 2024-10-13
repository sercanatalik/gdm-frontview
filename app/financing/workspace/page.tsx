"use client"
import React, { useEffect, useRef, useState } from 'react';
import { useSidebar } from "@/hooks/use-sidebar";
import { WorkspaceMenu } from './workspacemenu';
import "@finos/perspective-workspace";
import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc";

import "@finos/perspective-viewer/dist/css/themes.css";
import { createDatasource } from './datasource';
declare global {
    namespace JSX {
      interface IntrinsicElements {
        'perspective-workspace': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & { theme?: string },
          HTMLElement
        >;
      }
    }
  }

const DEFAULT_LAYOUT = {
    master: {
      widgets: ["One"],
    },
    detail: {
      main: {
        currentIndex: 0,
        type: "tab-area",
        widgets: ["Two"],
      },
    },
    viewers: {
      One: { table: "data","plugin":"Datagrid",
        plugin_config:{"columns":{},"editable":false,"scroll_lock":false},"columns_config":{},"settings":false,"title":"ByDesk","group_by":["desk"],"split_by":[],"columns":["notional_amount"],"filter":[],"sort":[],"expressions":{},"aggregates":{}},
      Two: {
        table: "data",
        title: "Test Widget 2",
        editable: false,
        linked: true,
      },
    },
  };

import { PerspectiveWorker } from '@finos/perspective';


function Workspace() {
  const workspaceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [worker, setWorker] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Dynamically import the appropriate CSS file based on the theme
    import(`@finos/perspective-workspace/dist/css/pro${theme === 'dark' ? '-dark' : ''}.css`);

    // Initialize perspective only on the client-side
    import("@finos/perspective").then((perspective) => {
      const newWorker = perspective.default.shared_worker();
      setWorker(newWorker);
    });


  // Add resize observer to update workspace dimensions
  const resizeObserver = new ResizeObserver(() => {
    if (workspaceRef.current && containerRef.current) {
      workspaceRef.current.style.width = `${containerRef.current.offsetWidth}px`;
      workspaceRef.current.style.height = `${containerRef.current.offsetHeight}px`;
    }
  });

  if (containerRef.current) {
    resizeObserver.observe(containerRef.current);
  }

  }, [theme]);

  useEffect(() => {
    if (worker && workspaceRef.current) {
      const datasource = createDatasource(worker);
      
      const updateData = async () => {
        const table = await datasource();
        workspaceRef.current.tables.set("data", table);
        console.log("updated data");
      };

      // Initial data load
      updateData();
      workspaceRef.current.restore(DEFAULT_LAYOUT);

      // Set up interval to refresh data every minute
      const intervalId = setInterval(updateData, 60000);


      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [worker]);


  const saveLayout = async (layoutName: string) => {
    if (layoutName.trim()) {
      const savedLayouts = JSON.parse(localStorage.getItem('workspaceLayouts') || '{}');
      const currentLayout = await workspaceRef.current?.save();
      savedLayouts[layoutName] = JSON.stringify(currentLayout);
      localStorage.setItem('workspaceLayouts', JSON.stringify(savedLayouts));
      console.log('Layout saved as', layoutName,savedLayouts[layoutName] );
    }
  };


  return (
   

    <div ref={containerRef} style={{ position: 'absolute', width: '100%', height: '100%', right: 0, top: 0  }}>
    <WorkspaceMenu  saveLayout={saveLayout}/>  
        <perspective-workspace
        ref={workspaceRef}
    theme={theme === 'dark' ? "Pro Dark" : "Pro Light"}
    id="workspace"
    style={{ position: 'absolute', width: '100%', height: '100%', right: 0, top: 20, bottom: 0}}

  />

</div>
     
  );
}

export default Workspace;
