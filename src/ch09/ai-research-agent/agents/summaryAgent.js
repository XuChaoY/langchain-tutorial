import model from '../config/model.js'

export async function summaryAgent(state){
  const result = await model.invoke([
    {
      role:"system",
      content:"请输出完整报告"
    },
    ...state.messages
  ])

  return {
    messages:[result]
  }
}