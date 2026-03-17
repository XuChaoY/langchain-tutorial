import { StateGraph, StateSchema, ReducedValue, START, END } from '@langchain/langgraph'
import { createWorkerAgent } from '../agents/workerFactory.js'
import { criticAgent } from '../agents/criticAgent.js'
import { supervisorAgent } from '../agents/supervisorAgent.js'
import { toolNode } from './toolNode.js'
import * as z from 'zod'
import { tools } from '../tools/index.js'

const researchAgent = createWorkerAgent("research", {description:"擅长搜索资料和整理资料", tools})
const codingAgent   = createWorkerAgent("coding", {description:"擅长编码和实现功能"})
const analysisAgent = createWorkerAgent("analysis", {description:"擅长分析问题和提供解决方案"})
const summaryAgent = createWorkerAgent("summary", {description:"擅长总结和报告"})

const State = new StateSchema({
  messages: new ReducedValue(
    z.array(z.any()).default([]),
    { reducer: (x, y) => x.concat(y) }
  ),
  tasks: new ReducedValue(
    z.array(z.any()).default([]),
    { reducer: (x, y) => x.concat(y) }
  ),
  currentTask: z.any().optional(),
})

const graph = new StateGraph(State)

graph.addNode("supervisor", supervisorAgent)

graph.addNode("research", researchAgent)
graph.addNode("analysis", analysisAgent)
graph.addNode("coding", codingAgent)

graph.addNode("summary", summaryAgent)
graph.addNode("critic", criticAgent)

graph.addNode("tool", toolNode)

graph.addEdge(START,"supervisor")

graph.addConditionalEdges(
  "supervisor",
  (state)=>{
    const last = state.messages.at(-1).content

    if(last.includes("research")) return "research"
    if(last.includes("coding")) return "coding"
    if(last.includes("analysis")) return "analysis"
    if(last.includes("summary")) return "summary"

    return END
  },
  {
    research:"research",
    coding:"coding",
    analysis:"analysis",
    summary:"summary",
    [END]:END
  }
)

graph.addConditionalEdges(
  "research",
  (state)=>{
    const last = state.messages.at(-1)
    const calls = last?.tool_calls ?? []
    return calls.length > 0 ? "tool" : "supervisor"
  },
  {
    tool:"tool",
    supervisor:"supervisor"
  }
)
graph.addEdge("analysis","supervisor")
graph.addEdge("coding","supervisor")

graph.addEdge("summary","critic")
graph.addEdge("tool","research")

graph.addConditionalEdges(
  "critic",
  (state)=>{
    const last = state.messages.at(-1).content

    if(last.includes("RETRY")) return "supervisor"

    return END
  },
  {
    supervisor:"supervisor",
    [END]:END
  }
)

export const app = graph.compile();
