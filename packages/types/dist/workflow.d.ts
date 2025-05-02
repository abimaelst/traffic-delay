export type DelayWorkflowInput = {
    route: string;
    customerPhone: string;
};
export type DelayWorkflowOutput = {
    delayMinutes: number;
    notified: boolean;
};
