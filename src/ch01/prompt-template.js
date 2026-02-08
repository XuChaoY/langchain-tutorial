import { ChatDeepSeek } from '@langchain/deepseek'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
    modelName:'deepseek-chat',
    apiKey: process.env.DEEPSEEK_API_KEY,
    temperature:0.7,
    maxTokens:1000,
})

// 创建prompt模板
const prompt = PromptTemplate.fromTemplate(`
你是一个{role},专门解决{domain}相关的问题。

用户问题：{question}

请提供详细、专业的回答。包含以下要素：
1. 问题分析
2. 解决方案
3. 代码示例（如果适用）
4. 最佳实践建议

回答：
`)

// 创建输出解析器
const outputParse = new StringOutputParser();

// 构建处理链
const chain = prompt.pipe(model).pipe(outputParse);

async function promptTemplateExanple(){
    try{
        // 接收响应
        const response = await chain.invoke({
            role:"资深前端工程师",
            domain:"vue 性能优化",
            question:"如何优化vue 应用的渲染性能"
        })
        console.log("优化建议：", response);
    }catch(error){
        console.error("处理失败：", error)
    }
}

promptTemplateExanple();