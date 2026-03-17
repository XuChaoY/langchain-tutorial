import model from '../config/model.js'

export async function supervisorAgent(state){
  const res = await model.invoke([
    {
      role:"system",
      content:`
你是调度中心：

决定下一步执行哪个 agent：
research / coding / analysis / summary / end

只返回名称
`
    },
    ...state.messages
  ])

  return {
    messages:[res]
  }
}