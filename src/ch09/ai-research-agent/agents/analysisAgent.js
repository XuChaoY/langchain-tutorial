import model from '../config/model.js'

export async function analysisAgent(state){
  const result = await model.invoke([
    {
      role:"system",
      content:"请分析研究结果"
    },
    ...state.messages
  ])

  return {
    messages:[result]
  }
}