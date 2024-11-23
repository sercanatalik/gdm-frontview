'use client';

import { useEffect, useState, useRef } from 'react';
import type { IPerspectiveViewerElement, HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';
import { Table } from '@finos/perspective';

const loadPerspective = async () => {
  await import("@finos/perspective-viewer");
  await import("@finos/perspective-viewer-datagrid");
  await import("@finos/perspective-viewer-d3fc");
  await import('@finos/perspective-viewer/dist/css/pro.css');
  return await import('@finos/perspective');
};
import { useSidebar } from "@/hooks/use-sidebar";


interface MarketData {
  instrument: string;
  price: number;
  timestamp: string;
}



// Update component signature to accept props
export default function Markets({  }: MarketsProps) {
  const [table, setTable] = useState<Table | null>(null);
  const viewerRef = useRef<HTMLPerspectiveViewerElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(100);

  const sidebar = useSidebar();
  const isSidebarOpen = sidebar.isOpen;


  const [worker, setWorker] = useState<any>(null);
  const schema = {
    instrument: 'string',
    price: 'float',
    timestamp: 'datetime',
  };


  useEffect(() => {
    setSidebarWidth(isSidebarOpen ? 300 : 120);
  }, [isSidebarOpen]);

  useEffect(() => {
    loadPerspective().then((perspective) => {
      const w = perspective.default.shared_worker();
      setWorker(w);
    });
  }, []);

  useEffect(() => {
    if (!worker) return;
    
    worker.table(schema).then(newTable => {
        
      setTable(newTable);
      
      // Set up SSE connection
      const eventSource = new EventSource('/api/monitor');
        
      eventSource.onmessage = (event) => {
        const data: MarketData = JSON.parse(event.data);
        // console.log(data);
        // newTable.update([{instrument: data.instrument, price: data.price, timestamp: data.timestamp}]);
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
      };

      // Configure perspective viewer using the ref instead of querySelector
      if (viewerRef.current) {
        viewerRef.current.load(newTable);
        viewerRef.current.restore({
          plugin: 'datagrid',
          columns: ['instrument', 'price', 'timestamp'],
          aggregates: {
            price: 'last',
          },
          sort: [['timestamp', 'desc']],
        });
      }

      return () => {
        eventSource.close();
        newTable.delete();
      };
    });
  }, [worker]);

  return (
      <perspective-viewer ref={viewerRef} class="perspective-viewer" 
      id="workspace"
      style={{ position: 'absolute', width: '80%', height: '100%', top: 0, left: sidebarWidth}}
      ></perspective-viewer>

  );
}
