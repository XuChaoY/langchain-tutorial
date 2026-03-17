import { tool } from 'langchain'
import * as z from 'zod'

export const searchTool = tool(
  async ({query}) => {
    const controller = new AbortController()
    const timer = setTimeout(()=>controller.abort(), 8000)
    try{
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`,
        { signal: controller.signal }
      )
      clearTimeout(timer)
      const data = await res.json()
      return data.Abstract || ''
    }catch(e){
      clearTimeout(timer)
      return `搜索失败: ${e?.message || '网络错误'}`
    }
  },
  {
    name:"search",
    description:"搜索互联网信息",
    schema:z.object({
      query:z.string()
    })
  }
)
