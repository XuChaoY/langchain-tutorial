import fs from 'node:fs/promises'
import path from 'node:path'

export async function loadMarkdownDir(dir, tag = 'default'){
  const files = await fs.readdir(dir);
  const docs = [];
  for(const f of files){
    if(!f.endsWith('.md')) continue;
    const full = path.join(dir, f);
    const text = await fs.readFile(full, 'utf-8');
    docs.push({id:f, text, meta:{source:full, type:'md', tag}});
  }
  return docs;
}

export function clean(text){
  return text.replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[\t\u00A0]/g, ' ')
        .trim();
}
