import { getTrafficDelayInMinutes } from './traffic';
import { generateDelayMessage } from './ai';
import { sendEmail } from './email';

export async function monitorRouteAndNotifyCustomer(): Promise<void> {
  const start = '-122.42,37.78'; // SF
  const end = '-121.89,37.33';   // SJ
  const delay = await getTrafficDelayInMinutes(start, end);

  console.log(`⏱ Delay: ${delay} minutes`);

  if (delay > 30) {
    const message = await generateDelayMessage(delay);
    console.log('✉️ AI Message:', message);
    await sendEmail('customer@example.com', message);
  } else {
    console.log('✅ Delay under threshold — no notification sent.');
  }
}