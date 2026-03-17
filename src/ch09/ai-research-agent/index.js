import { app } from './graph/agentGraph.js'

async function main(){
  const response = await app.invoke({
    messages:[
      {
        role:'human',
        content:'未来 AI 对前端开发有什么影响？'
      }
    ]
  })
  console.log(response)
}

main()