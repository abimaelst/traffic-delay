import path from 'path';
import { Worker } from '@temporalio/worker';
import * as activities from '@traffic/workflows';

async function run() {
  const worker = await Worker.create({
    workflowsPath: path.join(
      __dirname,
      '../../../packages/workflows/lib/workflows'
    ),
    activities,
    taskQueue: 'monitor-route',
  });
  console.log('👷 Temporal worker started (monitor-route)');
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});