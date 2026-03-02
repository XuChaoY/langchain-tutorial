import { OpenAIEmbeddings } from '@langchain/openai'
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'

const hasOpenAI = !!process.env.OPENAI_API_KEY
const embeddings = hasOpenAI
  ? new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small'
    })
  : new HuggingFaceTransformersEmbeddings({
      model: 'Xenova/bge-small-zh-v1.5',
      cacheDir: undefined
    })

const store = await MemoryVectorStore.fromTexts(
  [
    'React 是用于构建界面的 JavaScript 库。',
    'Vue 提供基于响应式和组件化的开发方式。',
    'Node.js 是基于 V8 的 JavaScript 运行时。'
  ],
  [
    { source: 'react' },
    { source: 'vue' },
    { source: 'node' }
  ],
  embeddings
)

const retriever = store.asRetriever({ k: 3 })

const model = new ChatDeepSeek({
  modelName: 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0.3
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是技术助手。仅基于给定上下文回答，无法回答请说不知道。'],
  ['human', '问题：{question}\n上下文：\n{context}']
])

const chain = RunnableSequence.from([
  {
    question: (input) => input.question,
    context: async (input) => {
      const docs = await retriever.invoke(input.question)
      return docs.map((d) => d.pageContent).join('\n---\n')
    }
  },
  prompt,
  model,
  new StringOutputParser()
])

const answer = await chain.invoke({ question: '什么是Node.js' })
console.log(answer)
