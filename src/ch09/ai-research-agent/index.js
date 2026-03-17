import { app } from './graph/agentGraph.js'

async function main(){
  const stream = await app.streamEvents({
    messages:[
      {
        role:'human',
        content:'未来 AI 对前端开发有什么影响？'
      }
    ],
  }, {
      version: "v2",
    })
  for await (const event of stream) {
    if (event.event === "on_chat_model_stream") {
      const token = event.data?.chunk?.content
      if (token) {
        process.stdout.write(token)
      }
    }
  }
}

main()