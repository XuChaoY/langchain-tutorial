import { ChatDeepSeek } from '@langchain/deepseek'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
    modelName:'deepseek-chat',   //模型名称
    apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
    temperature:0.7,  // 温度
    maxTokens:1000,   // 模型token
    verbose:true,     // 详细模式
})

async function basicChat(){
    try{
        // 创建消息数组
        const messages = [
            new SystemMessage("你现在是一个专业的前端开发助手，擅长javascript和vue开发。"),
            new HumanMessage("请解释一下什么是vue hook, 并给出一个简单的使用示例。")
        ]

        // 发送消息并且接收响应
        const response = await model.invoke(messages);

        console.log("AI 助手回答：");
        console.log(response.content);
    }catch(error){
        console.error("发生错误：",error);
    }
}

// 运行示例
basicChat();