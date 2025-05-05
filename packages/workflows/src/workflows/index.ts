import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { MonitorRouteInput } from '@traffic/types';

const {
  getTrafficDelayInMinutes,
  generateDelayMessage,
  sendEmail,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10s',
  retry: {
    maximumAttempts: 3,
    initialInterval: '2s',
    backoffCoefficient: 2,
  },
});

export async function monitorRouteWorkflow(params: MonitorRouteInput): Promise<void> {
  const { start, end, toEmail } = params;
  const delay = await getTrafficDelayInMinutes(start, end);

  if (delay > 30) {
    const message = await generateDelayMessage(delay);
    await sendEmail(toEmail, message);
  }

  console.log('✅ Delay under threshold — no notification sent.');
}