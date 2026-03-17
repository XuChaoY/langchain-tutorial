import model from '../config/model.js'
import { tools } from '../tools/index.js'

const modelWithTools = model.bindTools(tools)
export async function researchAgent(state) {
  const result = await modelWithTools.invoke(state.messages)
  return {
    messages:[result]
  }
}