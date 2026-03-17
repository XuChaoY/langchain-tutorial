import { ChatDeepSeek } from '@langchain/deepseek'
import { createAgent } from 'langchain'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import 'dotenv/config'

const model = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  modelName: "deepseek-chat",
  temperature: 0.7,
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你现在是一个天气预报助手'],
  ['human', '{input}']
])

const messages = await prompt.formatMessages({
  input: '今天武汉天气怎么样？'
})
const agent = createAgent({
  model,
  tools: [],
})

const response = await agent.invoke({
  messages
})

console.log(response) // { text: '今天武汉天气怎么样？' }