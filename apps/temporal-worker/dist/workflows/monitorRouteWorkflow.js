"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorRouteWorkflow = void 0;
const workflow_1 = require("@temporalio/workflow");
const { getTrafficDelayInMinutes, generateDelayMessage, sendEmail } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
});
async function monitorRouteWorkflow() {
    const start = '-122.42,37.78';
    const end = '-121.89,37.33';
    const delay = await getTrafficDelayInMinutes(start, end);
    if (delay > 30) {
        const message = await generateDelayMessage(delay);
        await sendEmail(process.env.TO_EMAIL, message);
    }
}
exports.monitorRouteWorkflow = monitorRouteWorkflow;
