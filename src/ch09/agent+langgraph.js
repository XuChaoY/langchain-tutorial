import { ChatDeepSeek } from '@langchain/deepseek'
import { StateGraph, MessagesAnnotation, START, END } from '@langchain/langgraph'
import { AIMessage, ToolMessage } from '@langchain/core/messages'
import weatherTool from './tools/weatherTool.js'
import geocodeTool from './tools/geocodeTool.js'

import 'dotenv/config'

// ----- model ------
const model = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  modelName: "deepseek-chat",
  temperature: 0.7,
})

const tools = [geocodeTool, weatherTool]

// ----------  model绑定tools  ------------
const modelWithTools = model.bindTools(tools)

// ----------  agent Node  --------------
async function agentNode(state) {
  const response = await modelWithTools.invoke(state.messages)
  return {
    messages:[response]
  }
}

// ------------ tools Node ------------
async function toolsNode(state) {
  const lastMessage = state.messages[state.messages.length - 1] 
  const toolCalls = lastMessage.tool_calls ?? [];

  const toolMessages = [];
  for (const call of toolCalls) {
    const selectedTool = tools.find(tool => tool.name === call.name);
    const result = await selectedTool.invoke(call.args);

    toolMessages.push(new ToolMessage({
      content: typeof result === 'string' ? result : JSON.stringify(result),
      tool_call_id: call.id,
      name: call.name,
    }));
  }

  return {
    messages: toolMessages
  }
}

// ----------- router ------------
function shouldContinue(state) {
  const lastMessage = state.messages[state.messages.length - 1]
  if(lastMessage instanceof AIMessage && (lastMessage.tool_calls?.length ?? 0) > 0) {
    return 'tool'
  }

  return END
}

// ----------- graph ------------
const graph = new StateGraph(MessagesAnnotation);
graph.addNode('agent', agentNode);
graph.addNode('tool', toolsNode);

graph.addEdge(START, 'agent');

graph.addConditionalEdges('agent', shouldContinue, {
  tool: 'tool',
  [END]: END
});

graph.addEdge('tool', 'agent');

// ----------- compile ------------
const app = graph.compile()

const response = await app.invoke({
  messages: [
    {
      role:'system',
      content: "你可以使用工具解决用户问题。工具：如果用户提供城市名，需调用geocode_city工具传入{ city }，转化为{ latitude, longitude }，再调用get_weather；如果提供经纬度，传 { latitude, longitude }直接调用get_weather查询天气即可。"
    },
    {
      role:'human',
      content:"武汉今天天气怎么样？"
    }
  ]
})
console.log(response)
