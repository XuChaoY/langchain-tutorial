import model from '../config/model.js'

export function createWorkerAgent(role, config = {}){

  return async function(state){

    const task = state.currentTask
    const desc = config.description || ''
    const tools = config.tools || null
    const usedModel = tools ? model.bindTools(tools) : model
    const history = Array.isArray(state.messages) ? state.messages : []

    const res = await usedModel.invoke([
      {
        role:"system",
        content:`你是${role}专家。${desc}`
      },
      ...history,
      ...(task ? [{ role:"user", content: JSON.stringify(task) }] : [])
    ])

    return {
      messages:[res],
      tasks:[{
        role,
        result:res.content,
        meta:config
      }]
    }
  }
}
