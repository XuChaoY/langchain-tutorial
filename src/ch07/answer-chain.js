import { RunnableSequence } from "@langchain/core/runnables";
import { ChatDeepSeek } from "@langchain/deepseek";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { answerPrompt } from "./prompt.js";

export function buildAnswerChain() {
  const llm = new ChatDeepSeek({
    modelName:'deepseek-chat',   //模型名称
    apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
    temperature:0,  // 温度
  })
  const parser = new JsonOutputParser();
  return RunnableSequence.from([
    answerPrompt,
    llm,
    parser,
  ]);
}
