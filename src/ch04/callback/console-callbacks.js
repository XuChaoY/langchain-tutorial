import { ChatDeepSeek } from "@langchain/deepseek"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ConsoleCallbackHandler  } from "@langchain/classic/callbacks"
import "dotenv/config"


const model = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  modelName: "deepseek-chat",
  temperature: 0.7,
  callbacks: [new ConsoleCallbackHandler()] // 添加回调处理器
})

const outputParser = new StringOutputParser();

const chain = model.pipe(outputParser);

async function run(){
  try{
    const messages = [
      ['system', '你现在是一个智能助手，请根据用户的问题回答。'],
      ['human', '武汉有什么景点？']
    ]
    const response = await chain.invoke(messages);
    console.log(response)
  }catch(error){
    console.log(error)
  }
}

run()