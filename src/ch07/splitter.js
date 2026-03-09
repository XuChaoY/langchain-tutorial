import { clean } from './loaders.js'

function split(text, size = 900, overlap = 120){
  const out = [];
  let i = 0;
  while (i < text.length) {
    const s = text.slice(i, i + size);
    out.push(s);
    i+= size - overlap;
  }
  return out;
}

export function toChunks(docs, size = 900, overlap = 120){
  const arr = [];
  for(const d of docs){
    const t = clean(d.text);
    const parts = split(t, size, overlap);
    parts.forEach((p, idx) => {
      arr.push({
        id:`${d.id}#${idx}`,
        text:p,
        meta:{
          ...d.meta,
          chunkIndex:idx
        }
      })
    })
  }
  return arr;
}
