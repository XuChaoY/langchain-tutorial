import { topk } from './retrievers.js'

function keywordSearch(q, corpus, k = 5){
  const lower = q.toLowerCase();
  return corpus.map(d => ({d, s:(d.text.toLowerCase().match(new RegExp(lower, 'g')) || []).length}))
  .sort((a, b) => b.s - a.s).slice(0, k).map(x => ({text:x.d.text, meta:{id:x.d.id, source:'kw'}}));
}

export async function hybrid(name){
  const retr = await topk(name);
  return async (q) => {
    const [vecHits, kwHists] = await Promise.all([
        retr(q, 8),
        Promise.resolve(keywordSearch(q, [{id:"k1", text:"RAG结合检索生成"}, {id:"k2", text:"MMR提升"}], 4))
      ]);
    const items = [
      ...vecHits.map(h => ({...h, weight: 0.7*(1 - (h.score ?? 0))})),
      ...kwHists.map(h => ({...h, weight: 0.3})),
    ]
    return items.sort((a, b) => b.weight - a.weight).slice(0, 6).map(({weight, ...rest})=> rest);
  }
}
