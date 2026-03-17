import { ToolMessage } from '@langchain/core/messages'  
import { searchTool } from '../tools/searchTool.js'
import { browserTool } from '../tools/browserTool.js'

const toolRegistry = {
  search: searchTool,
  browser: browserTool,
}
export async function toolNode(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  const calls = lastMessage.tool_calls ?? [];
  const results = await Promise.all(
    calls.map(async call => {
      const tool = toolRegistry[call.name];
      const res = await tool.invoke(call.args);
      return new ToolMessage({
        content:typeof res === 'string' ? res : JSON.stringify(res),
        tool_call_id:call.id,
        name: call.name,
      })
    })
  )
  return {
    messages: results,
  }
}