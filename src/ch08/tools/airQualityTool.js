import { tool } from 'langchain'
import * as z from 'zod'
import 'dotenv/config'

// 根据经纬度查询空气质量
const airQualityTool = tool(
  async ({ latitude, longitude }) => {

    const url =
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    const air = data.list[0];

    return {
      aqi: air.main.aqi,
      pm2_5: air.components.pm2_5,
      pm10: air.components.pm10
    };
  },
  {
    name: "get_air_quality",
    description: "Get air quality",
    schema: z.object({
      latitude: z.number(),
      longitude: z.number()
    })
  }
);

export default airQualityTool;