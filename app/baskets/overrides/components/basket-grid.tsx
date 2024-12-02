'use client';

import { useEffect, useState, useRef } from 'react';
import type { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';
import { Table } from '@finos/perspective';
import '@finos/perspective-viewer/dist/css/pro.css';
import { useSidebar } from "@/hooks/use-sidebar";

interface BasketData {

id: string;
sym: string;
weight: number;
category: string;
name: string;
model: string;
description: string;
ticker: string;
updatedAt: string;
asofDate: string;

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

export default function BasketGrid({ data }: { data: BasketData[] }) {
  const [table, setTable] = useState<Table | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const viewerRef = useRef<HTMLPerspectiveViewerElement>(null);
  const { isOpen } = useSidebar();
  const sidebarWidth = isOpen ? 300 : 120;

  const schema = {
    id: 'string',
    sym: 'string',
    weight: 'float',
    category: 'string',
    name: 'string',
    model: 'string',
    description: 'string',
    ticker: 'string',
    updatedAt: 'string',
    asofDate: 'string',
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
        const newTable = await worker.table(schema, { index: "id" });
        setTable(newTable);

        if (data.length > 0) {
          await newTable.update(data);
        }

        // const eventSource = new EventSource('/api/monitor');

        // eventSource.onmessage = (event) => {
        //   const data: MarketData = JSON.parse(event.data);
        //   newTable.update([data]);
        // };

        // eventSource.onerror = (error) => {
        //   console.error('SSE Error:', error);
        //   eventSource.close();
        // };

        await viewerRef.current?.load(newTable);
        await viewerRef.current?.restore({
          plugin: 'datagrid',
          columns: ['sym', 'weight', 'category', 'name', 'model', 'description', 'ticker', 'updatedAt', 'asofDate'],
          sort: [
            [
                "updatedAt",
                "desc"
            ],
            [
                "name",
                "asc"
            ]
        ]
        });

        return () => {
        //   eventSource.close();
          newTable.delete();
        };
      } catch (error) {
        console.error('Error setting up perspective table:', error);
      }
    };

    setupTable();
  }, [worker, data]);

  return (
    <perspective-viewer
      ref={viewerRef}
      className="perspective-viewer"
      style={{
        position: 'absolute',
        width: '80%',
        height: '80%',
        top: 70,
        left: sidebarWidth
      }}
    />
  );
}
