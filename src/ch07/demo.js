import "dotenv/config"
import fs from "node:fs/promises"
import path from "node:path"
import { loadMarkdownDir } from "./loaders.js"
import { toChunks } from "./splitter.js"
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables"
import { buildAnswerChain } from "./answer-chain.js"
import { validateCitations, shortCircuitIfEmpty } from "./guards.js"
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers"

async function ensureDocs(dir = "./docs") {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
  const files = await fs.readdir(dir)
  if (!files.some(f => f.toLowerCase().endsWith(".md"))) {
    const sample = [
      "# 什么是RAG",
      "",
      "RAG（检索增强生成）结合了检索与生成，它先从知识库检索相关片段，再交给大模型生成答案。",
      "",
      "优点包括：提升事实性、可控引用来源、更易更新知识。",
      "",
      "# 什么是菠萝手机",
      "",
      "菠萝手机是徐超阳瞎编的的手机品牌，主要用于测试。"
    ].join("\n")
    const p = path.join(dir, "sample.md")
    await fs.writeFile(p, sample, "utf-8")
  }
}

async function main() {
  const docsDir = "./docs"
  await ensureDocs(docsDir)
  // 加载与切分文档
  const raw = await loadMarkdownDir(docsDir, "news")
  const chunks = toChunks(raw, 20, 5)
  const texts = chunks.map(c => c.text)
  const metas = chunks.map(c => ({ ...c.meta, id: c.id }))
  // 内存向量索引（无需外部服务）
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/bge-small-zh-v1.5",
    cacheDir: undefined
  })
  const vectors = await embeddings.embedDocuments(texts)
  const norm = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  const vecNorms = vectors.map(norm)
  const dataset = vectors.map((v, i) => ({ v, n: vecNorms[i], meta: metas[i], text: texts[i] }))
  // 构建最小 RAG 流水线：检索 → 组织上下文 → 回答 → 引用校验
  const toChunkList = RunnableLambda.from(async (q) => {
    const k = 8
    const qv = await embeddings.embedQuery(q)
    const qn = norm(qv)
    const sims = dataset.map(d => {
      const dot = d.v.reduce((s, x, i) => s + x * qv[i], 0)
      const sim = dot / (d.n * qn)
      return { text: d.text, score: 1 - sim, meta: d.meta }
    })
    const hits = sims.sort((a, b) => a.score - b.score).slice(0, k)
    shortCircuitIfEmpty(hits)
    const chunksStr = hits
      .map((h, i) => `#${i} [${h.meta?.source || "mem"}] ${String(h.text).replace(/\n/g, " ").slice(0, 400)}...`)
      .join("\n")
    return { question: q, chunks: chunksStr }
  })
  const answer = buildAnswerChain()
  const check = RunnableLambda.from((res) => validateCitations(res))
  const pipeline = RunnableSequence.from([toChunkList, answer, check])

  const question = "简要解释菠萝手机，并给出引用来源"
  const res = await pipeline.invoke(question)
  console.log("Answer:")
  console.log(res?.answer ?? "")
  console.log("Citations:")
  console.log(JSON.stringify(res?.citations ?? [], null, 2))
}

await main()
