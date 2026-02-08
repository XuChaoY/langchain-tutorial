import { ChatDeepSeek } from '@langchain/deepseek'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from "@langchain/core/output_parsers"
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
    modelName:'deepseek-chat',   //模型名称
    apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
    temperature:0.7,  // 温度
})

const prompt = PromptTemplate.fromTemplate(`
你是一个{role}。请用{style}风格解答：
问题：{question}
要求：
- 使用分点说明
- 控制在{maxTokens}字以内
- 若不确定，请直接说出“我需要多少山下文”    
`)

const outputParse = new StringOutputParser();
const chain = prompt.pipe(model).pipe(outputParse)

async function run(){
    const response = await chain.invoke({
        role:'Web 性能专家',
        style:'简洁务实',
        question:'如何优化首屏渲染？',
        maxTokens:200
    })
    console.log(response)
}

run();

