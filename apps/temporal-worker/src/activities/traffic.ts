import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

export async function getTrafficDelayInMinutes(start: string, end: string): Promise<number> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}`;
  const params = {
    access_token: MAPBOX_TOKEN,
    overview: 'simplified',
    annotations: 'duration',
  };

  const response = await axios.get(url, { params });
  const [route] = response.data.routes;
  return Math.round(route.duration / 60);
}