import { RunnableLambda, RunnableParallel, RunnableSequence } from "@langchain/core/runnables";
import { ChatDeepSeek } from "@langchain/deepseek"
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from '@langchain/core/output_parsers'
import "dotenv/config"

const sanitize = new RunnableLambda(({ text }) => ({
  text: text.replace(/\s+/g, " ").trim().slice(0, 4000),
}));

const detectPrompt = PromptTemplate.fromTemplate(
  `判断以下文本的语言：\n{txt}\n只返回语言名称，如 Chinese/English/Japanese`
);
// 初始化模型
const model = new ChatDeepSeek({
  modelName:'deepseek-chat',   //模型名称
  apiKey: process.env.DEEPSEEK_API_KEY,   // 模型apikey
  temperature:0,  // 温度
})
const detect = detectPrompt.pipe(model);

const translatePrompt = PromptTemplate.fromTemplate(
  `将以下文本翻译成中文：\n{txt}`
);
const translate = translatePrompt.pipe(model);

const summaryPrompt = PromptTemplate.fromTemplate(
  `用要点总结下面文本（最多 5 条）：\n{txt}`
);
const summary = summaryPrompt.pipe(model);

const stylePrompt = PromptTemplate.fromTemplate(
  `判断文本风格标签（技术/营销/新闻/随笔/其他）：\n{txt}\n只输出一个标签`
);
const tagsPrompt = PromptTemplate.fromTemplate(
  `从文本中抽取 3 个关键词（中文）：\n{txt}\n以逗号分隔`
);

const parallelClassify = new RunnableParallel({
  style: stylePrompt.pipe(model),
  tags: tagsPrompt.pipe(model),
});

const pack = new RunnableLambda(async (ctx) => {
  return {
    lang: ctx.lang.trim(),
    text: ctx.textZh.trim(),
    summary: ctx.summary.trim(),
    style: String(ctx.style.content || ctx.style).trim(),
    tags: String(ctx.tags.content || ctx.tags)
      .split(/[,，]/).map(s => s.trim()).filter(Boolean).slice(0, 5),
    original: ctx.original,
  };
});

const schemaPrompt = PromptTemplate.fromTemplate(
  `将以下对象重新组织为严格 JSON（keys: lang,text,summary,style,tags,original）：\n{obj}`
);
const parser = new JsonOutputParser();
const schema = schemaPrompt.pipe(llm).pipe(parser);

export const contentPipeline = RunnableSequence.from([
  new RunnableLambda((input) => ({ original: input.text })),
  new RunnableLambda(async ({ original }) => ({ original, cleaned: await sanitize.invoke({ text: original }) })),
  new RunnableLambda(async ({ original, cleaned }) => ({ original, cleaned, lang: (await detect.invoke({ txt: cleaned.text })).content })),
  new RunnableLambda(async ({ original, cleaned, lang }) => ({
    original,
    lang,
    textZh: lang.toLowerCase().startsWith("chinese") ? cleaned.text : (await translate.invoke({ txt: cleaned.text })).content,
  })),
  new RunnableLambda(async ({ original, lang, textZh }) => ({ original, lang, textZh, summary: (await summary.invoke({ txt: textZh })).content })),
  new RunnableLambda(async ({ original, lang, textZh, summary }) => ({
    original, lang, textZh, summary,
    classify: await parallelClassify.invoke({ txt: textZh }),
  })),
  new RunnableLambda(({ original, lang, textZh, summary, classify }) => ({
    original, lang, textZh, summary,
    style: classify.style, tags: classify.tags,
  })),
  pack,
  new RunnableLambda(async (obj) => schema.invoke({ obj: JSON.stringify(obj, null, 2) })),
]);

async function run() {
  const input = { text: "LangChain unifies prompts, LLMs, retrievers into composable pipelines." };
  const out = await contentPipeline.invoke(input);
  console.log(out);
}

run();