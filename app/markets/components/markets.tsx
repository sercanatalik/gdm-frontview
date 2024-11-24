'use client';

import { useEffect, useState, useRef } from 'react';
import type { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';
import { Table } from '@finos/perspective';
import '@finos/perspective-viewer/dist/css/pro.css';
import { useSidebar } from "@/hooks/use-sidebar";

interface MarketData {
  key: string;
  px: {
    last: number;
    spread: number;
    timestamp: Date;
    bid: number;
    ask: number;
    yest: number;
  };
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
    instrument: 'string',
    last: 'float',
    bid: 'float',
    ask: 'float',
    spread: 'float',
    yest: 'float',
    timestamp: 'datetime',
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
        const newTable = await worker.table(schema,{index: "instrument"});
        setTable(newTable);

        const eventSource = new EventSource('/api/monitor');
        
        eventSource.onmessage = (event) => {
          const data: MarketData = JSON.parse(event.data);
          newTable.update<TableSchema>([{
            instrument: data.key,
            last: data.px.last,
            bid: data.px.bid,
            ask: data.px.ask,
            spread: data.px.spread,
            yest: data.px.yest,
            timestamp: new Date(data.px.timestamp)
          }]);
        };

        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          eventSource.close();
        };

        await viewerRef.current?.load(newTable);
        await viewerRef.current?.restore({
          plugin: 'datagrid',
          columns: ['instrument', 'last','bid', 'ask', 'spread','yest', 'timestamp'],
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
