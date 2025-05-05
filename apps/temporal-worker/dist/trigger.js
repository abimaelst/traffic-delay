"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@temporalio/client");
const workflows_1 = require("./workflows");
async function run() {
    const connection = await client_1.Connection.connect();
    const client = new client_1.WorkflowClient({ connection });
    const toEmail = process.env.TO_EMAIL || 'abimaelst@gmail.com';
    const handle = await client.start(workflows_1.monitorRouteWorkflow, {
        taskQueue: 'monitor-route',
        workflowId: `monitor-route-${Date.now()}`,
        args: [toEmail],
    });
    console.log(`✅ Workflow started: ${handle.workflowId}`);
}
run();
