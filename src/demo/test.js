import { initChatModel } from 'langchain'
import "dotenv/config"

// 工厂方法
const model = await initChatModel(
  "deepseek-chat",   //模型名称
  {
    modelProvider:'deepseek',  // 模型提供商   
    apiKey: process.env.MGW_API_KEY,  // 模型api key
    baseUrl: process.env.MGW_API_URL,    // 模型api地址
    temperature: 0.7, // 温度 0-2，0表示严格按照输入回答，越大表示越可以自由发挥
  }
)
const response = await model.invoke("你好")
console.log(response)