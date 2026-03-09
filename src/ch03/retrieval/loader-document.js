import { OpenAIEmbeddings } from '@langchain/openai'
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents'
import { ChatDeepSeek } from '@langchain/deepseek'

import { createRetrievalChain } from '@langchain/classic/chains/retrieval'
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
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

const model = new ChatDeepSeek({
  modelName: 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0.3
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是技术助手。仅基于给定上下文回答，无法回答请说不知道。'],
  ['human', '问题：{input}\n上下文：\n{context}']
])

/**
本地 txt
   ↓
TextLoader
   ↓
Splitter
   ↓
Embedding
   ↓
VectorStore
   ↓
Retriever
   ↓
LLM
   ↓
Answer
 */
// 加载本地文档
const loder = new TextLoader("./src/ch03/retrieval/info.txt");
const docs = await loder.load();
// 创建文档链
const chain = await createStuffDocumentsChain({
  llm: model,
  prompt: prompt
});
// 分割器示例
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 50,
  chunkOverlap: 10,
})
// 分割文档输出文档对象列表
const splitterDocs = await splitter.splitDocuments(docs);

// 创建向量存储
const vectorStore = await MemoryVectorStore.fromDocuments(splitterDocs, embeddings);

//  检索器
const retriever = vectorStore.asRetriever({
  k: 2,
});

// 创建检索链
const retrievalChain = await createRetrievalChain({
  combineDocsChain: chain,
  retriever: retriever,
});

const answer = await retrievalChain.invoke({ input: '什么是菠萝手机？' })
console.log(answer)
