import { ChatDeepSeek } from '@langchain/deepseek'
import { PromptTemplate } from '@langchain/core/prompts'
// 添加环境变量
import 'dotenv/config'

class CodeReviewAssistant{
    model = null;
    reviewPrompt = null;

    constructor(){
        this.model = new ChatDeepSeek({
            modelName:'deepseek-chat',
            apiKey: process.env.DEEPSEEK_API_KEY,
            temperature:0.7,
            maxTokens:1000,
        })

        this.reviewPrompt = PromptTemplate.fromTemplate(`
        请审查以下{language}代码，并提供详细的反馈；
        代码：
        \'\'\'{language}
        {code}
        \'\'\'
        请从以下方面进行评估
        1. 代码质量和可读性
        2. 性能优化建议
        3. 安全性考虑
        4. 最佳实践建议
        5. 潜在的bug或者问题
        
        审查报告：
        `)
    }

    async reviewCode(code, language = "javascript"){
        const chain = this.reviewPrompt.pipe(this.model);

        const response = await chain.invoke({
            code,
            language
        })
        return response.content;
    }
}

//使用示例
const reviewer = new CodeReviewAssistant();
const code = `
function calculateTotal(items){
    let total = 0;
    for(let i = 0; i < items.length; i++){
        total += items[i].price * items[i].quantity;
    }
    return total;
}
`;

const result = await reviewer.reviewCode(code, 'javascript');
console.log(result)