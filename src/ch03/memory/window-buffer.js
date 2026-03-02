import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableWithMessageHistory, RunnableSequence } from '@langchain/core/runnables'
import { WindowChatHistory } from './window-chat-history.js'
import { HybridChatHistory } from './hybrid-chat-history.js'
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

// 输出解析器
const outputParser = new StringOutputParser()

const chain = RunnableSequence.from([
  prompt,
  model,
  outputParser
])

const sessionStore = new Map()
const chatHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory:(sessionId)=>{
    const key = String(sessionId)
    if(!sessionStore.has(key)){
      sessionStore.set(key, new HybridChatHistory({
        llm: model,
        windowSize: 5,
        summaryTrigger:12
      }))
    }
    return sessionStore.get(key)
  },
  inputMessagesKey:'input',
  historyMessagesKey:'history'
})

async function run(input){
  const response = await chatHistory.invoke(
    {
      input
    },
    {
      configurable:{
        sessionId: 'test'
      }
    }
  )
  console.log(response)
}


const cases = [
  '武汉天气怎么样？',
  '有什么景点推荐？',
  '将前面聊到的问题复述一下？'
]

for(const value of cases){
  await run(value)
}