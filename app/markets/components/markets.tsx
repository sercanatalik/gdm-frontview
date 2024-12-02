'use client';

import { useEffect, useState, useRef } from 'react';
import type { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';
import { Table } from '@finos/perspective';
import '@finos/perspective-viewer/dist/css/pro.css';
import { useSidebar } from "@/hooks/use-sidebar";

interface MarketData {
  key: string;
  sym: string;
  last: number;
  spread: number;
  timestamp: string;
  bid: number;
  ask: number;
  yest: number;
  indexSpread: number;
  indexYield: number;
  indexDuration: number;
  indexDv01: number;
  duration: number;
  dtm: number;
  price: number;
  ytm: number;
  zSpread: number;
  dv01: number;

}



interface TableSchema {
  instrument: string;
  last: number;
  spread: number;
  timestamp: Date;
}

const loadPerspective = async () => {
  await Promise.all([
    import("@finos/perspective-viewer") as any,
    import("@finos/perspective-viewer-datagrid") as any,
    import("@finos/perspective-viewer-d3fc") as any
  ]);
  return import('@finos/perspective');
};

export default function Markets() {
  const [table, setTable] = useState<Table | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const viewerRef = useRef<HTMLPerspectiveViewerElement>(null);
  const { isOpen } = useSidebar();
  const sidebarWidth = isOpen ? 300 : 120;

  const schema = {
    sym: 'string',
    last: 'float',
    bid: 'float',
    ask: 'float',
    spread: 'float',
    yest: 'float',
    timestamp: 'string',
    duration: 'float',
    dtm: 'float',
    price: 'float',
    ytm: 'float',
    zSpread: 'float',
    dv01: 'float',
    indexSpread: 'float',
    indexYield: 'float',
    indexDuration: 'float',
    indexDv01: 'float',
  };

  useEffect(() => {
    loadPerspective().then((perspective) => {
      setWorker(perspective.default.shared_worker());
    });
  }, []);

  useEffect(() => {
    if (!worker || !viewerRef.current) return;

    const setupTable = async () => {
      try {
        const newTable = await worker.table(schema, { index: "sym" });
        setTable(newTable);

        const eventSource = new EventSource('/api/monitor');

        eventSource.onmessage = (event) => {
          const data: MarketData = JSON.parse(event.data);
          
        
          newTable.update<TableSchema>([{
            ...data,
            timestamp: data.timestamp
          }]);
        };

        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          eventSource.close();
        };

        await viewerRef.current?.load(newTable);
        await viewerRef.current?.restore({
          plugin: 'datagrid',
          columns: ['sym', 'price', 'ytm', 'zSpread', 'dv01', 'duration', 'timestamp'],
          aggregates: {

          },
          sort: [['timestamp', 'desc']],
        });

        return () => {
          eventSource.close();
          newTable.delete();
        };
      } catch (error) {
        console.error('Error setting up perspective table:', error);
      }
    };

    setupTable();
  }, [worker]);

  return (
    <perspective-viewer
      ref={viewerRef}
      className="perspective-viewer"
      style={{
        position: 'absolute',
        width: '80%',
        height: '100%',
        top: 0,
        left: sidebarWidth
      }}
    />
  );
}
