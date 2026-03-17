import model from "../config/model.js"

export async function plannerAgent(state){
  const res = await model.invoke([
    {
      role:"system",
      content:"你是任务规划专家，将问题拆解成 research 和 summary 两个步骤"
    },
    ...state.messages
  ])

  return {
    messages:[res]
  }
}