"use client"
import React, { useEffect, useRef, useState } from 'react';
import { useSidebar } from "@/hooks/use-sidebar";
import { WorkspaceMenu } from './workspacemenu';
import "@finos/perspective-workspace";
import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc";

import "@finos/perspective-workspace/dist/css/pro-dark.css";
// import "@finos/perspective-workspace/dist/css/pro.css";
import "@finos/perspective-viewer/dist/css/themes.css";


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
      widgets: ["Two"],
    },
    detail: {
      main: {
        currentIndex: 0,
        type: "tab-area",
        widgets: ["One"],
      },
    },
    viewers: {
      One: {
        table: "data",
        title: "Test Widget I",
        editable: true,
        linked: true,
      },
      Two: {
        table: "data",
        title: "Test Widget 2",
        editable: true,
        linked: true,
      },
    },
  };

function Workspace() {
  const workspaceRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
   

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

  }, []);

  useEffect(() => {
    if (worker && workspaceRef.current) {
      const datasource = async () => {
        return await worker.table([{ "a": [1,2,3] }]);
      };

      workspaceRef.current.tables.set("data", Promise.resolve(datasource()));
      workspaceRef.current.restore(DEFAULT_LAYOUT);
    }
  }, [worker]);

  return (
   

    <div ref={containerRef} style={{ position: 'absolute', width: '100%', height: '100%', right: 0, top: 0  }}>
    <WorkspaceMenu/>  
        <perspective-workspace
        ref={workspaceRef}
    theme="Pro Dark"
    id="workspace"
    style={{ position: 'absolute', width: '100%', height: '100%', right: 0, top: 20, bottom: 0}}

  />

</div>
     
  );
}

export default Workspace;
