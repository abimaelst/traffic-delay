"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorRouteWorkflow = void 0;
const workflow_1 = require("@temporalio/workflow");
const { getTrafficDelayInMinutes, generateDelayMessage, sendEmail, } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '10s',
    retry: {
        maximumAttempts: 3,
        initialInterval: '2s',
        backoffCoefficient: 2,
    },
});
async function monitorRouteWorkflow(toEmail) {
    const start = '-122.4194,37.7749';
    const end = '-121.8863,37.3382';
    const delay = await getTrafficDelayInMinutes(start, end);
    if (delay > 30) {
        const message = await generateDelayMessage(delay);
        await sendEmail(toEmail, message);
    }
}
exports.monitorRouteWorkflow = monitorRouteWorkflow;
