import { ChatDeepSeek } from '@langchain/deepseek'
import { StateGraph, MessagesAnnotation, START, END } from '@langchain/langgraph'
import { AIMessage, ToolMessage } from '@langchain/core/messages'

import 'dotenv/config'

// ----- model ------
const model = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  modelName: "deepseek-chat",
  temperature: 0.7,
})

// ------------ agentA ----------
async function researchAgent(state) {
  const result = await model.invoke([
    ...state.messages,
    { role:"system", content:"你是研究专家" }
  ])

  return {
    messages:[result]
  }
}

// ------------ 汇总器 ----------
async function summarizer(state) {
  const result = await model.invoke([
    ...state.messages,
    {
      role:"system",
      content:"总结多个专家的回答"
    }
  ])

  return {
    messages:[result]
  }
}
// ------------ agentB ----------
async function mathAgent(state) {
  const result = await model.invoke([
    ...state.messages,
    { role:"system", content:"你是数学专家" }
  ])

  return {
    messages:[result]
  }
}

// ----------- graph ------------
const graph = new StateGraph(MessagesAnnotation);
// 添加节点
graph.addNode("research", researchAgent)
graph.addNode("math", mathAgent)
graph.addNode("summary", summarizer)

// 添加边  分叉开始
graph.addEdge(START, "research")
graph.addEdge(START, "math")

// 添加边  分叉聚合
graph.addEdge("research", "summary")
graph.addEdge("math", "summary")

// 添加边  聚合结束
graph.addEdge("summary", END)

// ----------- compile ------------
const app = graph.compile()

const response = await app.invoke({
  messages: [
    {
      role:'human',
      content:"量子计算对密码学有什么影响？"
    }
  ]
})

console.log(response)