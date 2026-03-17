import airQualityTool from "./airQualityTool.js";
import weatherTool from "./weatherTool.js";
import geocodeTool from "./geocodeTool.js";

import { ChatDeepSeek } from '@langchain/deepseek'
import { createAgent } from 'langchain'
import 'dotenv/config'

const model = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  modelName: "deepseek-chat",
  temperature: 0.7,
})

const agent = createAgent({
  model,
  tools: [geocodeTool, weatherTool, airQualityTool],
  prompt
})

const response = await agent.stream(
  {
    messages: [
      { role: "human", content: "武汉今天天气怎么样？" }
    ]
  },
  {
    streamMode:"messages"
  }
)

for await (const chunk of response) {
  if(chunk?.length>0 && chunk[0]?.content){
    process.stdout.write(chunk[0]?.content)
  }
}
// const stream = await agent.stream(
//   {
//     messages: [
//       { role: "user", content: "北京今天天气怎么样？" }
//     ]
//   },
//   {
//     streamMode: "updates"
//   }
// )

// for await (const chunk of stream) {
//   const keys = Object.keys(chunk)
//   if(keys[0] === 'model_request'){
//     console.log(chunk.model_request.messages[0].content)
//   }
//   if(keys[0] === 'tools'){
//     console.log('调用工具：'+ chunk.tools.messages[0].name)
//   }
// }

