import { ChatDeepSeek } from '@langchain/deepseek'
import { PromptTemplate, FewShotPromptTemplate} from '@langchain/core/prompts'
import { StringOutputParser } from "@langchain/core/output_parsers"
// 添加环境变量
import 'dotenv/config'

// 初始化模型
const model = new ChatDeepSeek({
    modelName:'deepseek-chat',   //模型名称
    apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
    temperature:0.7,  // 温度
})

const examplePrompt = PromptTemplate.fromTemplate(`
    用户：{input}\n分类: {label}
`)

const examples = [
    { input: "页面加载很慢", label: "性能问题"},
    { input: "按钮点击没反应", label: "交互缺陷"},
    { input: "接口经常 500", label: "后端故障"}
]

const fewshot = new FewShotPromptTemplate({
    examples,
    examplePrompt,
    prefix: "请根据用户诉求给出标签(性能问题/交互问题/后端故障)：",
    suffix: "用户：{input}\n分类：",
    inputVariables:["input"]
})

const outputParse = new StringOutputParser()
const chain = fewshot.pipe(model).pipe(outputParse);

async function run(){
    const response = await chain.invoke({
        input:"首屏白屏3秒"
    })
    console.log(response)
}

run();
