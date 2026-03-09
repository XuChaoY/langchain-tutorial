import { openCollection } from './indexer-chroma.js'

export async function topk(name){
  const store = await openCollection(name);
  return async(q, k, filter)=>{
    const docs = await store.similaritySearchWithScore(q, k, filter);
    return docs.map(([d, s])=>({text:d.pageContent, score:s, meta:d.metadata}))
  }
}

export function mmr(hits, limit = 5){
  const out = [];
  const seen = new Set();
  for(const h of hits){
    const key = `${h.meta?.source}#${h.meta?.chunkIndex}`;
    if(seen.has(key)) continue;
    seen.add(key);
    out.push(h);
    if(out.length >= limit) break;
  }
  return out;
}
