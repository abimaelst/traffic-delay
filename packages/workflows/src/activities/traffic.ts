import { ApplicationFailure } from '@temporalio/activity';
import axios from 'axios';
import { config } from 'dotenv';
config();

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

export async function getTrafficDelayInMinutes(start: string, end: string): Promise<number> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${encodeURIComponent(start)};${encodeURIComponent(end)}`;
  const params = {
    access_token: MAPBOX_TOKEN,
    overview: 'simplified',
    annotations: 'duration',
  };

  try {
    const response = await axios.get(url, { params });

    if (!response.data?.routes?.length) {
      throw new Error('No route data returned from Mapbox');
    }

    const route = response.data.routes[0];
    const durationSeconds = route.duration;

    if (typeof durationSeconds !== 'number') {
      throw new Error('Invalid duration returned from Mapbox');
    }

    const delay = Math.round(durationSeconds / 60)
    console.log(`⏱ Delay: ${delay} minutes`);

    return delay;

  } catch (error: any) {
    let status = axios.isAxiosError(error) ? error.response?.status : undefined;
    let message = axios.isAxiosError(error) ? error.response?.data?.message || error.message : error.message;

    console.error(`[Mapbox API Error] ${status ?? 'unknown'}: ${message}`);

    if (status && status >= 400 && status < 500) {
      throw ApplicationFailure.nonRetryable(`Mapbox API error ${status}: ${message}`);
    }

    throw error;
  }
}