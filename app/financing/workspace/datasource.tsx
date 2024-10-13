import { PerspectiveWorker } from '@finos/perspective';

export const fetchDataSource = (worker: PerspectiveWorker) => async () => {
    const response = await fetch('/api/financing/risk');
    const data = await response.json();
    return await worker.table(data.data);
};



export const streamDataSource = (worker: PerspectiveWorker) => async () => {
   
    const eventSource = new EventSource('/api/financing/risk/stream');
    eventSource.onopen = () => {
        console.log('EventSource opened');
      };
    eventSource.onmessage = (event) => {
        console.log('Received data:', event.data);
        // const data = JSON.parse(event.data);
        // console.log('Received data:', data);
        

        // Process each row of data here
      };
    
      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
      };



}



