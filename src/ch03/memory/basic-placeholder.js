import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
  modelName:'deepseek-chat',   //模型名称
  apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
  temperature:0.7,  // 温度
})

// 问答模板
const prompt  = ChatPromptTemplate.fromMessages([
  ['system', '你是简洁的前端顾问。'],
  new MessagesPlaceholder('history'),
  ['human', '{input}']
])

const outputParser = new StringOutputParser();
const chain = prompt.pipe(model).pipe(outputParser);

async function run(history, input){
  const response = await chain.invoke({
    history,
    input
  })
  console.log(response)
}

run([['human', '我们刚才讨论了首屏优化']], '继续说说图片优化')
