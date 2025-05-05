import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import path from 'path';

async function run() {
  const worker = await Worker.create({
    workflowsPath: path.join(__dirname, 'workflows'),
    activities,
    taskQueue: 'monitor-route',
  });

  console.log('👷 Temporal worker started on task queue: monitor-route');
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});