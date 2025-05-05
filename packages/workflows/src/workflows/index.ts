import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

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

export async function monitorRouteWorkflow({ start, end, toEmail }: { start: string, end: string, toEmail: string }): Promise<void> {
  const delay = await getTrafficDelayInMinutes(start, end);

  if (delay > 30) {
    const message = await generateDelayMessage(delay);
    await sendEmail(toEmail, message);
  }
}