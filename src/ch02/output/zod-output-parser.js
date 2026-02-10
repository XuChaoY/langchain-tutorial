import { ChatDeepSeek } from '@langchain/deepseek'
import { PromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
  modelName:'deepseek-chat',   //模型名称
  apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
  temperature:0.7,  // 温度
})

const schema = z.object({
  title:z.string(),
  tags:z.array(z.string()).max(5),
  estimateHours:z.number().min(1).max(80),
})

const outputParser = StructuredOutputParser.fromZodSchema(schema)

const prompt = PromptTemplate.fromTemplate(`
基于需求生成任务卡片：
需求：{requirement}
请严格输出：
{format_instructions}  
`);

const chain = prompt.pipe(model).pipe(outputParser)

async function run(){
  const response = await chain.invoke({
    requirement:'实现文章阅读进度统计与收藏功能',
    format_instructions:outputParser.getFormatInstructions()
  })
  console.log(response)
}

run();