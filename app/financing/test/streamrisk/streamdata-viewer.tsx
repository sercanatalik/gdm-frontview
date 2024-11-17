'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

// Add proper typing for the row data
interface StreamRow {
  eventId: number;
  [key: string]: any;  // for other dynamic fields
}

export const StreamDataViewer = () => {
  const [rows, setRows] = useState<StreamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchStream = async () => {
    setLoading(true);
    setError(null);
    setRows([]);

    try {
      const url = lastUpdate 
        ? `/api/financing/risk/stream?lastUpdate=${encodeURIComponent(lastUpdate)}`
        : '/api/financing/risk/stream?lastUpdate=0';
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const row = JSON.parse(event.data) as StreamRow;
          setLastUpdate(String(Math.max(Number(lastUpdate) || 0, row.eventId)));
          setRows(prevRows => [...prevRows, row]);
        } catch (e) {
          console.error('Failed to parse event data:', event.data, e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setLoading(false);
      };

      // Cleanup function to close the connection
      return () => {
        eventSource.close();
        setLoading(false);
      };
    } catch (err: any) {  // Type the error
      setError(err.message);
      console.error('Stream error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream();
  }, []);

  const handleRefresh = () => {
    fetchStream();
  };

  const columns: ColumnDef<any>[] = React.useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ row }) => {
        const value = row.getValue(key);
        return typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);
      },
    }));
  }, [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            ClickHouse Data Stream
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Last Update: {lastUpdate}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {loading && rows.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

