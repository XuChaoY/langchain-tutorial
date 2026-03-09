import { RunnableSequence, RunnableLambda } from "@langchain/core/runnables";
import { buildAnswerChain } from "./answer-chain.js";
import { hybrid } from "./hybrid.js";
import { validateCitations, shortCircuitIfEmpty } from "./guards.js";

export async function buildRagPipeline(name = "news") {
  const retrieve = await hybrid(name);
  const toChunkList = new RunnableLambda(async (q) => {
    const hits = await retrieve(q);
    shortCircuitIfEmpty(hits);
    const chunks = hits.map((h, i) => `#${i} [${h.meta?.source || "vec"}] ${String(h.text).replace(/\n/g," ").slice(0,400)}...`).join("\n");
    return { question: q, chunks };
  });

  const answer = buildAnswerChain();
  const check = new RunnableLambda((res) => validateCitations(res));

  return RunnableSequence.from([
    toChunkList,
    answer,
    check,
  ]);
}
