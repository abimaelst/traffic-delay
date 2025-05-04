import { proxyActivities } from '@temporalio/workflow';
import type { Activities } from './activities';
import type {
  CheckTrafficWorkflowInput,
  TrafficData,
  DelayNotification
} from '@traffic/types';

// Define the activities that will be used in the workflow
const {
  getTrafficData,
  generateDelayMessage,
  sendNotification,
  calculateNewEta
} = proxyActivities<Activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
  },
});

/**
 * Workflow to check traffic conditions and notify customers of delays
 * 
 * The workflow performs the following steps:
 * 1. Get traffic data for the specified route
 * 2. Check if delay exceeds threshold
 * 3. If delay threshold exceeded, generate notification message using AI
 * 4. Send notification to customer
 */
export async function checkTrafficDelayWorkflow(input: CheckTrafficWorkflowInput): Promise<DelayNotification | null> {
  console.log(`Starting traffic delay check for shipment ${input.shipmentId}`);

  try {
    // Step 1: Fetch traffic data for the specified route
    const trafficData: TrafficData = await getTrafficData(input.route);
    console.log(`Traffic data received. Current delay: ${trafficData.delay} minutes`);

    // Step 2: Check if delay exceeds threshold
    if (trafficData.delay <= input.delayThreshold) {
      console.log(`Delay (${trafficData.delay} min) is under threshold (${input.delayThreshold} min). No notification needed.`);
      return null;
    }

    // Calculate new ETA based on delay
    const newEta = await calculateNewEta(input.estimatedDeliveryTime, trafficData.delay);

    // Step 3: Generate delay notification message using AI
    const delayInfo = {
      customerName: "", // This will be populated in the activity
      shipmentId: input.shipmentId,
      originalEta: input.estimatedDeliveryTime,
      newEta,
      delayMinutes: trafficData.delay,
      congestionLevel: trafficData.congestionLevel
    };

    const aiMessage = await generateDelayMessage(input.customerId, delayInfo);

    // Step 4: Send notification to customer
    const notification: DelayNotification = {
      shipmentId: input.shipmentId,
      customerId: input.customerId,
      delayTime: trafficData.delay,
      originalEta: input.estimatedDeliveryTime,
      newEta,
      message: aiMessage,
      sent: false
    };

    const sentNotification = await sendNotification(notification);
    console.log(`Notification sent for shipment ${input.shipmentId}. Delay: ${trafficData.delay} minutes`);

    return sentNotification;
  } catch (error) {
    console.error(`Error in workflow: ${error}`);
    throw error;
  }
}