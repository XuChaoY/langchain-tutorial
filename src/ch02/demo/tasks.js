import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
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

const taskSchema = z.object({
  title: z.string().min(6),
  tags: z.array(z.string()).min(5),
  estimateHours:z.number().min(1).max(80),
  acceptance:z.array(z.string()).min(1),
})

const taskOutputParser = StructuredOutputParser.fromZodSchema(taskSchema);
const formatInstructions = taskOutputParser.getFormatInstructions();

const taskPrompt = ChatPromptTemplate.fromTemplate(`
请把需求转换成任务卡片（严格JSON）。
请严格按照以下格式返回：
{formatInstructions}
并满足这些约束：
- title 至少 6 个字符
- tags 至少包含 5 个短标签
- estimateHours 为 1 到 80 的整数
- acceptance 至少 1 条
需求：{requirement}
`)

const chain = taskPrompt.pipe(model).pipe(taskOutputParser)
async function generateTask(requirement = ""){
  const response = await chain.invoke({ requirement, formatInstructions })
  return response
}

const tasks = [
  "为博客增加全文搜索，支持标签过渡和高亮",
  "新增图片上传，自动化压缩并生成webp格式"
]

// 生成任务
for(const task of tasks){
  const result = await generateTask(task)
  const ok = !!result.title && result.estimateHours > 0 && result.acceptance.length > 0
  console.log("task:",  ok ? "✅" : "❌", result);
}

