import { PerspectiveWorker, Table as PerspectiveTable } from '@finos/perspective';
import type { Workspace as PerspectiveWorkspace } from '@finos/perspective-viewer';

// Add global variable declaration at the top
let currentEventId: number;

export const fetchDataSource = (worker: PerspectiveWorker) => async () => {
    const response = await fetch('/api/financing/risk');
    const data = await response.json();
    currentEventId = data.data && data.data.length > 0 
        ? data.data[data.data.length - 1].eventId 
        : '0';
    return {
        table: await worker.table(data.data,{ index: "id" }),
        eventId: currentEventId
    };
};


export const streamDataSource = (eventId: number, workspace: PerspectiveWorkspace) => async () => {
    const url = `/api/financing/risk/stream?lastUpdate=${encodeURIComponent(eventId)}`
    
    
    const eventSource = new EventSource(url);
    
    const table = await workspace.getTable("risk_view");
    eventSource.onopen = () => {
        console.log('SSE Connection opened', url);
    };
    
    eventSource.onmessage = async (event) => {
        try {
            const row = JSON.parse(event.data) ;
            await table.update([row]);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

            
        } catch (e) {
            console.error('Failed to parse event data:', event.data, e);
        }
    };
    
    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
    };
}



