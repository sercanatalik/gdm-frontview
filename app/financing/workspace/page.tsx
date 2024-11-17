"use client"
import React, { useEffect, useRef, useState } from 'react';
import { useSidebar } from "@/hooks/use-sidebar";
import { WorkspaceMenu } from './workspacemenu';
import "@finos/perspective-workspace";
import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc";
import { useRouter } from 'next/navigation';
import "@finos/perspective-viewer/dist/css/themes.css";
import { fetchDataSource, streamDataSource } from './datasource';
import { loadDefaultLayout } from './defaultLayouts';  
import { table } from 'console';

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

function Workspace() {
  const workspaceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [eventId, setEventId] = useState<number>(0);

  const router = useRouter();


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
      const datasource = fetchDataSource(worker);
      
      const updateData = async () => {
        const { table, eventId } = await datasource();
        setEventId(eventId);
        workspaceRef.current.tables.set("risk_view", table);
        console.log('eventId', eventId);
      };
      workspaceRef.current.restore(loadDefaultLayout());

      updateData();
  
    }
  }, [worker]);


  useEffect(() => {
    if (worker && workspaceRef.current) {
    
    
    const streamData = async () => {
      

      const datasource = streamDataSource(eventId,workspaceRef.current);
      await datasource();
      
      };

      streamData();

    }
    
  }, [eventId,worker]);


  const saveLayout = async (layoutName: string) => {
    if (layoutName.trim()) {
      const savedLayouts = JSON.parse(localStorage.getItem('workspaceLayouts') || '{}');
      const currentLayout = await workspaceRef.current?.save();
      savedLayouts[layoutName] = JSON.stringify(currentLayout);
      localStorage.setItem('workspaceLayouts', JSON.stringify(savedLayouts));
      console.log('Layout saved as', layoutName,savedLayouts[layoutName] );
      localStorage.setItem('workspaceSelectedLayout',layoutName);

      router.refresh();


    }
  };

  const loadLayout = (layoutName: string) => {
    workspaceRef.current.restore(loadDefaultLayout(layoutName));
  };  

  const downloadLayout = () => {
    const savedLayouts = localStorage.getItem('workspaceLayouts');
    if (savedLayouts) {
      const blob = new Blob([savedLayouts], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workspaceLayouts.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };  




  return (
   

    <div ref={containerRef} style={{ position: 'absolute', width: '100%', height: '100%', right: 0, top: 0  }}>
    <WorkspaceMenu  saveLayout={saveLayout} loadLayout={loadLayout} downloadLayout={downloadLayout} />  
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
