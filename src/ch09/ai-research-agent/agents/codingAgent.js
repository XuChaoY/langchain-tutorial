import model from '../config/model.js'

export async function codingAgent(state){
  const res = await model.invoke([
    {
      role:"system",
      content:"如果问题涉及代码，请给出示例"
    },
    ...state.messages
  ])
  return {
    messages:[res]
  }
}