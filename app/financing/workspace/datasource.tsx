import { PerspectiveWorker } from '@finos/perspective';

export const createDatasource = (worker: PerspectiveWorker) => async () => {
  const response = await fetch('/api/financing/risk');
  const data = await response.json();
  return await worker.table(data.data);
};

