import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from "@langchain/core/output_parsers"
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
    modelName:'deepseek-chat',   //模型名称
    apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
    temperature:0.7,  // 温度
})

const chatPrompt = ChatPromptTemplate.fromMessages([
    ['system', '你是资深前端教练，善于用类比解释复杂概念。'],
    ['human', '请用类比解释{topic}，并提供一个代码示例']
])

const outputParse = new StringOutputParser()
const chain = chatPrompt.pipe(model).pipe(outputParse)

async function run(){
    let response = await chain.invoke({
        topic:'虚拟dom'
    });
    console.log(response)
}

run();