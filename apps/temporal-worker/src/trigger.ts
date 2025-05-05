import { Connection, WorkflowClient } from '@temporalio/client';
import { monitorRouteWorkflow } from './workflows';

async function run() {
  const connection = await Connection.connect();
  const client = new WorkflowClient({ connection });

  const toEmail = process.env.TO_EMAIL || 'abimaelst@gmail.com';

  const handle = await client.start(monitorRouteWorkflow, {
    taskQueue: 'monitor-route',
    workflowId: `monitor-route-${Date.now()}`,
    args: [toEmail],
  });

  console.log(`✅ Workflow started: ${handle.workflowId}`);
}

run();