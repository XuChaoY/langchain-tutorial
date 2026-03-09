import { ChatDeepSeek } from "@langchain/deepseek"
import { StringOutputParser } from "@langchain/core/output_parsers"
import "dotenv/config"

const model = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  modelName: "deepseek-chat",
  temperature: 0.7,
})

const outputParser = new StringOutputParser();

const chain = model.pipe(outputParser);

async function run(){
  try{
    const messages = [
      ['system', '你现在是一个智能助手，请根据用户的问题回答。'],
      ['human', '武汉天气怎么样？']
    ]
    const stream = await chain.streamEvents(messages, {
      version: "v1",
    });
    for await (const event of stream) {
      console.log(event)
      if (event.event === "on_chat_model_stream") {
        const chunk = event.data.chunk
        process.stdout.write(chunk?.content ?? "")
      }
    }
  }catch(error){
    console.log(error)
  }
}

run()