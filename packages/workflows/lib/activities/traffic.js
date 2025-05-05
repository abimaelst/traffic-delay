"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrafficDelayInMinutes = getTrafficDelayInMinutes;
const activity_1 = require("@temporalio/activity");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
async function getTrafficDelayInMinutes(start, end) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${encodeURIComponent(start)};${encodeURIComponent(end)}`;
    const params = {
        access_token: MAPBOX_TOKEN,
        overview: 'simplified',
        annotations: 'duration',
    };
    try {
        const response = await axios_1.default.get(url, { params });
        if (!response.data?.routes?.length) {
            throw new Error('No route data returned from Mapbox');
        }
        const route = response.data.routes[0];
        const durationSeconds = route.duration;
        if (typeof durationSeconds !== 'number') {
            throw new Error('Invalid duration returned from Mapbox');
        }
        return Math.round(durationSeconds / 60);
    }
    catch (error) {
        let status = axios_1.default.isAxiosError(error) ? error.response?.status : undefined;
        let message = axios_1.default.isAxiosError(error) ? error.response?.data?.message || error.message : error.message;
        console.error(`[Mapbox API Error] ${status ?? 'unknown'}: ${message}`);
        if (status && status >= 400 && status < 500) {
            throw activity_1.ApplicationFailure.nonRetryable(`Mapbox API error ${status}: ${message}`);
        }
        throw error;
    }
}
//# sourceMappingURL=traffic.js.map