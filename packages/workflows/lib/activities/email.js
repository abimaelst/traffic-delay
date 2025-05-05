"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mail_1 = __importDefault(require("@sendgrid/mail"));
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'support@traffic.com';
if (!SENDGRID_API_KEY || !FROM_EMAIL) {
    throw new Error('Missing SENDGRID_API_KEY or FROM_EMAIL in .env');
}
mail_1.default.setApiKey(SENDGRID_API_KEY);
async function sendEmail(to, message) {
    const msg = {
        to,
        from: FROM_EMAIL,
        subject: 'Delivery Delay Notification',
        text: message,
    };
    try {
        await mail_1.default.send(msg);
        console.log(`📨 Email sent to ${to}`);
    }
    catch (err) {
        console.error('❌ Failed to send email:', err.response?.body || err.message);
        throw new Error('SendGrid email failed');
    }
}
//# sourceMappingURL=email.js.map