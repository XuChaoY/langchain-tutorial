import { topk, mmr } from './retrievers.js'

export async function userAwareRetriver(name, user){
  const retr = await topk(name);
  return async (q)=>{
    const filter = {}
    if(user.dept) filter.dept = user.dept;
    const hits = await retr(q, 10, Object.keys(filter).length ? filter : undefined);
    // 简单加权，匹配用户兴趣标签的得分略升
    const boost = (h) => (user.tags || []).some(t=>(h.meta?.tags || []).includes(t)) ? 0.05 : 0;
    return mmr(hits.sort((a, b) => (a.score - boost(a)) - (b.score - boost(b))), 6);
  }
}

