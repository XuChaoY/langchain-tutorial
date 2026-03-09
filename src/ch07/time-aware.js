import { topk, mmr } from  './retrievers.js'

export async function timeAwareRetriever(name, range){
  const retr = await topk(name)
  return async (q) =>{
    const filter = range ? {publishedAt:{$gte:range.from, $lte:range.to}} : undefined
    const hits = await retr(q, 12, filter)
    return mmr(hits, 6)
  }
}
