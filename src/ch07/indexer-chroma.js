import { Chroma } from '@langchain/community/vectorstores/chroma'
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers'
import { loadMarkdownDir } from './loaders.js'
import { toChunks } from './splitter.js'
import "dotenv/config"

export async function buildCollection(dir = './docs', name="news"){
  const raw = await loadMarkdownDir(dir, name);
  const chunks = toChunks(raw, 900, 120);
  const texts = chunks.map(c => c.text);
  const metas = chunks.map(c => ({...c.meta, id:c.id}));
  const db = await Chroma.fromTexts(texts, metas, new HuggingFaceTransformersEmbeddings({
      model: 'Xenova/bge-small-zh-v1.5',
      cacheDir: undefined
    }), {collectionName:`rag_${name}`});
  return db;
}

export async function openCollection(name="news"){
  return Chroma.fromExistingCollection(
    new HuggingFaceTransformersEmbeddings({
      model: 'Xenova/bge-small-zh-v1.5',
      cacheDir: undefined
    }),
    {
      collectionName:`rag_${name}`
    }
  )
}
