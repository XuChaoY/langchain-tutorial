import { tool } from 'langchain'
import * as z from 'zod'
import 'dotenv/config'

// 城市名称转经纬度
const geocodeTool = tool(
  async ({ city }) => {

    const url =
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    const place = data[0];

    return {
      city: place.name,
      latitude: place.lat,
      longitude: place.lon,
      country: place.country
    };
  },
  {
    name: "geocode_city",
    description: "Convert city name to latitude and longitude",
    schema: z.object({
      city: z.string()
    })
  }
);


export default geocodeTool