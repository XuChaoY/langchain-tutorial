import { ChatDeepSeek } from '@langchain/deepseek'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
// 添加环境变量
import 'dotenv/config'

class CustomerServiceBot{
    chain = null;

    constructor(){
        // 创建prompt模板
        const prompt = PromptTemplate.fromTemplate(`
        你是一个专业的客服助手，请根据以下信息回答用户问题。

        公司信息：{companyInfo}
        用户问题：{userQuestion}
        用户历史：{userHistory}

        请提供友好、专业的回答；
        `)

        // 初始化模型
        const model = new ChatDeepSeek({
            modelName:'deepseek-chat',
            apiKey: process.env.DEEPSEEK_API_KEY,
            temperature:0.7,
            maxTokens:1000,
        })
        const outputParse = new StringOutputParser();
        this.chain = prompt.pipe(model).pipe(outputParse);
    }

    async handleUserQuery(question, userHistory = ""){
        return await this.chain.invoke({
            companyInfo:"我们是一家专业的软件开发公司，提供web和移动应用开发服务",
            userQuestion:question,
            userHistory:userHistory
        })
    }
}

// 使用案例
const bot  = new CustomerServiceBot();

const response = await bot.handleUserQuery("你们的服务价格是多少？")
console.log(response);


