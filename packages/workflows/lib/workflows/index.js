"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorRouteWorkflow = monitorRouteWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { getTrafficDelayInMinutes, generateDelayMessage, sendEmail, } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '10s',
    retry: {
        maximumAttempts: 3,
        initialInterval: '2s',
        backoffCoefficient: 2,
    },
});
async function monitorRouteWorkflow({ start, end, toEmail }) {
    const delay = await getTrafficDelayInMinutes(start, end);
    if (delay > 30) {
        const message = await generateDelayMessage(delay);
        await sendEmail(toEmail, message);
    }
}
//# sourceMappingURL=index.js.map