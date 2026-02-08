import { ChatDeepSeek } from '@langchain/deepseek'
import { PromptTemplate, PipelinePromptTemplate} from '@langchain/core/prompts'
import { StringOutputParser } from "@langchain/core/output_parsers"
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
    modelName:'deepseek-chat',   //模型名称
    apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
    temperature:0.7,  // 温度
})

const partA = PromptTemplate.fromTemplate("基于主题扩写3个小标题：{topic}")

const partB = PromptTemplate.fromTemplate("基于小标题生成提纲，风格：{style}\n小标题：{headings}")

const pipeline = new PipelinePromptTemplate({
    finalPrompt:partB,
    pipelinePrompts:[
        {
            name:"headings",prompt:partA
        }
    ]
})

const outputParse = new StringOutputParser()
const chain = pipeline.pipe(model).pipe(outputParse);

async function run(){
    const response = await chain.invoke({
        topic:"前端监控系统",
        style:"专业简练"
    })
    console.log(response)
}

run();