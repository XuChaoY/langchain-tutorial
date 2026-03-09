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
      ['human', '武汉有什么景点？']
    ]
    const response = await chain.invoke(messages, {
      callbacks:[
        {
          handleLLMStart: (llm, invokeCount, prompts) => {
            console.log(`LLM started with ${prompts.length} prompts`)
          },
          handleLLMEnd: (llm, invokeCount, prompts, response) => {
            console.log(`LLM ended with ${response}`)
          },
          handleChainStart: (chain, invokeCount, prompts) => {
            console.log(`Chain started with ${prompts.length} prompts`)
          },
          handleChainEnd: (chain, invokeCount, prompts, response) => {
            console.log(`Chain ended with ${response}`)
          },
          handleLLMNewToken: (llm, invokeCount, prompts, token) => {
            console.log(`LLM new token: ${token}`)
          },
          handleLLMError: (llm, invokeCount, prompts, error) => {
            console.log(`LLM errored with ${error.message}`)
          }
        }
      ]
    });
    console.log(response)
  }catch(error){
    console.log(error)
  }
}

run()