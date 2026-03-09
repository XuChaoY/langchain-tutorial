import { StateGraph } from "@langchain/langgraph";
import { buildRagPipeline } from "./rag-pipeline.js";


export async function buildGraph() {
  const graph = new StateGraph({ channels: { q: { value: "" }, result: { value: {} }, error: { value: "" } } });
  graph.addNode("rag", async (s) => {
    try {
      const pipeline = await buildRagPipeline("news");
      const out = await pipeline.invoke(s.q);
      return { result: out };
    } catch (e) {
      return { error: e.message };
    }
  });
  graph.addEdge("start", "rag");
  graph.addEdge("rag", "end");
  return graph.compile();
}
