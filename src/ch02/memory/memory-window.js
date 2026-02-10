import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
  modelName:'deepseek-chat',   //模型名称
  apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
  temperature:0.7,  // 温度
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是连续对话的技术顾问，回答要简洁并且应用上下文'],
  new MessagesPlaceholder('history'),
  ['human', '{input}']
])

const chain = prompt
  .pipe(model)
  .pipe(new StringOutputParser())

const sessionStore = new Map()
const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: (sessionId) => {
    const key = String(sessionId)
    if (!sessionStore.has(key)) {
      sessionStore.set(key, new ChatMessageHistory())
    }
    return sessionStore.get(key)
  },
  inputMessagesKey:'input',   // 模板中的输入占位符
  historyMessagesKey:'history'  // 模板中的历史记录占位符
})


async function run(text = ''){
  const response = await chainWithHistory.invoke(
    { input: text },
    { configurable: { sessionId: 'demo-session' } }
  )
  // console.log(response)
  process.stdout.write(response + '\n')
}

process.stdin.on('data', async (data) => {
  const text = data.toString().trim()
  if (text === 'exit') {
    process.exit(0)
  }
  await run(text)
})
// await run('我们刚才讨论了哪些优化点？')
// await run('继续说说css层面的优化。')

