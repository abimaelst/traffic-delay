import { Worker } from '@temporalio/worker';
import { activities } from './activities';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

/**
 * Start the Temporal Worker
 */
async function run() {
  try {
    // Initialize the Worker
    const worker = await Worker.create({
      workflowsPath: path.join(__dirname, 'workflows.js'),
      activities,
      taskQueue: 'traffic-monitor-queue',
    });

    // Start listening for tasks
    await worker.run();
    console.log('Temporal Worker started successfully');
  } catch (error) {
    console.error('Error starting worker:', error);
    process.exit(1);
  }
}

// Run the worker
run().catch((err) => {
  console.error('Worker error:', err);
  process.exit(1);
});