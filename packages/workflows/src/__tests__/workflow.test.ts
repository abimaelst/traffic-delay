import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { v4 as uuid4 } from 'uuid';
import { monitorRouteWorkflow } from '../workflows';
import { MonitorRouteInput } from '@traffic/types';
import assert from 'assert';

let testEnv: TestWorkflowEnvironment;

before(async function () {
  this.timeout(10000);
  testEnv = await TestWorkflowEnvironment.createLocal();
});

after(async function () {
  this.timeout(10000);
  if (testEnv) {
    await testEnv.teardown();
  }
});

describe('monitorRouteWorkflow', function () {
  this.timeout(10000);

  it('should not send an email when delay is at or below threshold', async () => {
    const { client, nativeConnection } = testEnv;
    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: 'test',
      workflowsPath: require.resolve('../workflows/index'),
      activities: {
        getTrafficDelayInMinutes: async (_start: string, _end: string) => 30,
        generateDelayMessage: async () => { throw new Error('generateDelayMessage should not be called'); },
        sendEmail: async () => { throw new Error('sendEmail should not be called'); },
      },
    });

    await worker.runUntil(async () => {
      await client.workflow.execute(monitorRouteWorkflow, {
        workflowId: uuid4(),
        taskQueue: 'test',
        args: [{ start: 'a', end: 'b', toEmail: 'test@example.com' } as MonitorRouteInput],
      });
    });
  });

  it('should send an email when delay exceeds threshold', async () => {
    const { client, nativeConnection } = testEnv;
    let emailCalled = false;
    const expectedMessage = 'Delay: 45 minutes';

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: 'test',
      workflowsPath: require.resolve('../workflows/index'),
      activities: {
        getTrafficDelayInMinutes: async () => 45,
        generateDelayMessage: async (delay: number) => `Delay: ${delay} minutes`,
        sendEmail: async (_to: string, message: string) => {
          emailCalled = true;
          assert.strictEqual(message, expectedMessage);
        },
      },
    });

    await worker.runUntil(async () => {
      await client.workflow.execute(monitorRouteWorkflow, {
        workflowId: uuid4(),
        taskQueue: 'test',
        args: [{ start: 'x', end: 'y', toEmail: 'user@example.com' } as MonitorRouteInput],
      });
    });

    assert.ok(emailCalled, 'sendEmail should have been called');
  });
});