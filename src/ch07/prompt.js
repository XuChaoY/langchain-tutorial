import { ChatPromptTemplate } from "@langchain/core/prompts";

export const answerPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "你是严格的知识库问答助手。只依据提供的检索片段作答；无法回答则说“我不知道”。务必仅输出合法 JSON，且不要包含任何多余文字或注释。输出结构为：{{\"answer\": string, \"citations\": [{{\"source\": string}}] }}。从每行片段开头的 #编号 和方括号内的来源提取引用来源，引用去重后返回。"
  ],
  [
    "human",
    "问题：{question}\n检索片段（每行格式为“#编号 [source] 摘要...”）：\n{chunks}\n请基于以上片段作答；若片段不足以回答，请返回“我不知道”。务必返回规范 JSON。"
  ]
]);
