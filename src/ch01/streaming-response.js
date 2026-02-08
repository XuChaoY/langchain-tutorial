import { ChatDeepSeek } from '@langchain/deepseek'
import { HumanMessage } from '@langchain/core/messages'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
    modelName:'deepseek-chat',
    apiKey: process.env.DEEPSEEK_API_KEY,
    temperature:0.7,
    maxTokens:1000,
})

async function streamingExample(){
    try{
        console.log("AI 正在思考中...")
        console.log("回复：")

        const stream = await model.stream([
            new HumanMessage("请详细介绍一下Langchain.js的主要特性和持用场景。")
        ])

        // 逐块处理流式响应
        for await(const chunk of stream){
            process.stdout.write(chunk.content);
        }
        console.log("\n\n ---- 回复完成 ------");

    }catch(error){
        console.error("流式处理失败：",error)
    }
}

streamingExample();