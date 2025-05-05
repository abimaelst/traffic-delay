import axios from 'axios';
import { config } from 'dotenv';
config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function generateDelayMessage(delayInMinutes: number): Promise<string> {
  const prompt = `Generate a friendly message for a customer whose delivery is delayed by ${delayInMinutes} minutes due to traffic.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0]?.message?.content?.trim() ?? '[Default fallback message]';
}