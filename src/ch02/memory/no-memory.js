import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import readline from 'readline'
import chalk from 'chalk'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
  modelName:'deepseek-chat',   //模型名称
  apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
  temperature:0.7,  // 温度
})

const prompt = ChatPromptTemplate.fromTemplate(`
    你现在是一个智能问答助手，请根据用户提出的问题{question}，从知识库中查找相关内容并回答。
  `)

const outputParse = new StringOutputParser();
const chain = prompt.pipe(model).pipe(outputParse)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.red('User> ')
})
async function askQuestion(text = "") {
  try {
    const response = await chain.invoke({ question: text })
    console.log(chalk.green("AI> ")+response + '\n')
  }catch (error) {
    console.log(chalk.red(`Error: ${error.message}`))
  }
  rl.prompt()  // 👈 再次显示输入前缀
}

// 启动时显示一次 prompt
rl.prompt()

rl.on('line', async (line) => {
  const text = line.trim()

  if (text === 'exit') {
    rl.close()
    return
  }
  rl.pause();  // 暂停输入
  await askQuestion(text);
  rl.resume() // 恢复输入
})

rl.on('close', () => {
  console.log('Bye 👋')
  process.exit(0)
})