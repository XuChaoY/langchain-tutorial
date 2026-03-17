import model from '../config/model.js'

export async function criticAgent(state){
  const result = await model.invoke(
    [
      {
        role:"system",
        content:`
  评估回答质量。

  如果需要补充返回 RETRY
  否则返回 PASS
  `
      },
      ...state.messages
    ]
  )
  return {
    messages:[result]
  }
}