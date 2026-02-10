import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
  modelName:'deepseek-chat',   //模型名称
  apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
  temperature:0.7,  // 温度
})

const normalize = RunnableLambda.from(({ question }) => ({
  question: String(question ?? '').trim().slice(0, 300)
}))

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是严谨的技术作家，输出规范Markdown'],
  ['human', '请回答：{question}']
])

const outputParser = new StringOutputParser();

const chain = RunnableSequence.from([
  normalize,
  prompt,
  model,
  outputParser
])

// 上面结果等于：normalize.pipe(prompt).pipe(model).pipe(outputParser)

async function run() {
  const response = await chain.invoke({ question:'请介绍一下CSR/SSR/SSG的区别' })
  console.log(response)
}

run()
