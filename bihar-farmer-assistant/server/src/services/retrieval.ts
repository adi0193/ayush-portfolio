/**
 * Retrieval over the curated knowledge base (the "R" in RAG).
 *
 * MVP uses keyword scoring with crop/category boosts — transparent, fast, works offline,
 * and good enough for ~100s of entries. The interface is deliberately small so it can be
 * replaced by pgvector / hybrid BM25+embedding search later without touching callers.
 */
import { KNOWLEDGE, type KnowledgeEntry } from '../data/knowledge.js';

export interface RetrievalQuery {
  text: string;
  crop?: string;
  category?: KnowledgeEntry['category'];
  limit?: number;
}

export interface Retrieved {
  entry: KnowledgeEntry;
  score: number;
}

export function retrieve(q: RetrievalQuery, kb: KnowledgeEntry[] = KNOWLEDGE): Retrieved[] {
  const text = q.text.toLowerCase();
  const scored = kb
    .filter((e) => e.reviewStatus !== 'outdated')
    .map((entry) => {
      let hits = 0;
      for (const k of entry.keywords) if (text.includes(k.toLowerCase())) hits++;
      let score = hits * 2;
      const cropMatch = !!q.crop && entry.crops.includes(q.crop);
      if (cropMatch) score += 3;
      else if (q.crop && entry.crops.length > 0) score -= 4; // crop-specific entry for another crop
      // A crop-specific entry needs its crop named, or strong keyword evidence; otherwise a
      // question about an unsupported crop ("ड्रैगन फ्रूट के खेती") would get maize advice.
      if (q.category && entry.category === q.category) score += 1;
      const disqualified = (hits === 0 && !cropMatch) || (entry.crops.length > 0 && !cropMatch && hits < 2);
      return { entry, score: disqualified ? 0 : score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, q.limit ?? 3);
}
