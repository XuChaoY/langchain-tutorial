import { ChatDeepSeek } from '@langchain/deepseek'
import { PromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
  modelName:'deepseek-chat',   //模型名称
  apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
  temperature:0.7,  // 温度
})

const prompt = PromptTemplate.fromTemplate(`
你是项目规划助手。请输出严格的JSON：
{{
  "steps":[
    {{
      "title":"string", 
      "details":"string"
    }}
  ]
}}
主题：{topic}
`);

const outputParser = new JsonOutputParser()
const chain = prompt.pipe(model).pipe(outputParser)

async function run(){
  const response = await chain.invoke({topic:'前端监控平台搭建'})
  console.log(response.steps.map(s=>`- ${s.title}`).join("\n"))
}

run()
