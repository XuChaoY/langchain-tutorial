import { ChatDeepSeek } from '@langchain/deepseek';
import 'dotenv/config'

const model = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  modelName: "deepseek-chat",
  temperature: 0.7,
  streaming: true
})

export default model