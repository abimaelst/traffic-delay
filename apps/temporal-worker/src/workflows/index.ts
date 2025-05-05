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

export async function monitorRouteWorkflow(toEmail: string): Promise<void> {
  const start = '-122.4194,37.7749';
  const end = '-121.8863,37.3382';
  const delay = await getTrafficDelayInMinutes(start, end);

  if (delay > 30) {
    const message = await generateDelayMessage(delay);
    await sendEmail(toEmail, message);
  }
}