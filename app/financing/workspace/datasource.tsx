import { PerspectiveWorker } from '@finos/perspective';

// Add global variable declaration at the top
let currentEventId: number;

export const fetchDataSource = (worker: PerspectiveWorker) => async () => {
    const response = await fetch('/api/financing/risk');
    const data = await response.json();
    currentEventId = data.data && data.data.length > 0 
        ? data.data[data.data.length - 1].eventId 
        : '0';
    return {
        table: await worker.table(data.data),
        eventId: currentEventId
    };
};

interface StreamRow {
  eventId: number;
  [key: string]: any;  // for other dynamic fields
}

export const streamDataSource = (eventId: number, worker: PerspectiveWorker) => async () => {
    const url = `/api/financing/risk/stream?lastUpdate=${encodeURIComponent(eventId)}`
    console.log('url', url);
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
        console.log('SSE Connection opened', url);
    };
    
    eventSource.onmessage = async (event) => {
        try {
            const row = JSON.parse(event.data) as StreamRow;
            console.log('row', row);
            await worker.table.update(row);
        } catch (e) {
            console.error('Failed to parse event data:', event.data, e);
        }
    };
    
    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
    };
}



