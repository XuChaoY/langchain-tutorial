import { tool } from 'langchain'
import * as z from 'zod'
import 'dotenv/config'

// 根据经纬度查询天气
const weatherTool = tool(
  async (args) => {
    let latitude
    let longitude

    if (typeof args?.city === 'string' && args.city.trim().length > 0) {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(args.city)}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
      const geoRes = await fetch(geoUrl)
      const geoData = await geoRes.json()
      if (!Array.isArray(geoData) || geoData.length === 0) {
        throw new Error('City not found')
      }
      latitude = geoData[0].lat
      longitude = geoData[0].lon
    } else if (typeof args?.latitude === 'number' && typeof args?.longitude === 'number') {
      latitude = args.latitude
      longitude = args.longitude
    } else {
      throw new Error('Either city or latitude/longitude must be provided')
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    const res = await fetch(url)
    const data = await res.json()

    if (!data.list) throw new Error("Weather data not found");

    // 当前天气：取最接近现在的条目
    const current = {
      temperature: data.list[0].main.temp,
      humidity: data.list[0].main.humidity,
      windspeed: data.list[0].wind.speed,
      weather: data.list[0].weather[0].description
    };

    // 聚合每日预报
    const dailyForecast = {}
    for (const item of data.list) {
      const date = new Date(item.dt * 1000).toISOString().split("T")[0]
      if (!dailyForecast[date]) dailyForecast[date] = { min: Infinity, max: -Infinity, weather: {} }
      dailyForecast[date].min = Math.min(dailyForecast[date].min, item.main.temp)
      dailyForecast[date].max = Math.max(dailyForecast[date].max, item.main.temp)
      const desc = item.weather[0].description
      dailyForecast[date].weather[desc] = (dailyForecast[date].weather[desc] || 0) + 1
    }

    const forecast = Object.entries(dailyForecast).slice(0,5).map(([date, v]) => ({
      date,
      min: v.min,
      max: v.max,
      weather: Object.entries(v.weather).sort((a,b)=>b[1]-a[1])[0][0]
    }))

    return { current, forecast }
  },
  {
    name: "get_weather",
    description: "Get current weather and 5-day forecast by city or coordinates",
    schema: z.object({
      city: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
  }
);

export default weatherTool
