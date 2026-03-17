import { tool } from 'langchain'
import * as z from 'zod'

export const browserTool = tool(
  async ({url})=>{
    try{
      const html = await fetch(url).then(r=>r.text())
      return html.slice(0,2000)
    }catch(e){
      return `读取失败: ${e?.message || '网络错误'}`
    }
  },
  {
    name:"browser",
    description:"读取网页内容",
    schema:z.object({
      url:z.string()
    })
  }
)
