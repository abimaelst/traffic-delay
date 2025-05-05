"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDelayMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
async function generateDelayMessage(delayInMinutes) {
    const prompt = `Generate a friendly message for a customer whose delivery is delayed by ${delayInMinutes} minutes due to traffic.`;
    const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
    }, {
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data.choices[0]?.message?.content?.trim() ?? '[Default fallback message]';
}
exports.generateDelayMessage = generateDelayMessage;
