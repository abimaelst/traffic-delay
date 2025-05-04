import { monitorRouteAndNotifyCustomer } from './activities';

async function main() {
  console.log('🚦 Starting traffic monitor workflow...');
  await monitorRouteAndNotifyCustomer();
}

main().catch((err) => {
  console.error('❌ Workflow failed:', err);
});