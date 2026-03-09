export function validateCitations(res){
  const ok = Array.isArray(res.citations) && res.citations.length > 0 && res.citations.every(c => c.source);
  if(!ok) throw new Error('缺少引用或者格式错误')
  return res;
}

export function shortCircuitIfEmpty(hits){
  if(!hits || hits.length === 0) throw new Error('没有内容')
}
