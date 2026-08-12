import KnowledgeChunk from "../models/KnowledgeChunk.js";
import { getEmbedding } from "./ai.js";

export async function retrieveContext(question) {
  const queryEmbedding = await getEmbedding(question);

  const chunks = await KnowledgeChunk.aggregate([
    {
      $vectorSearch: {
        index: "knowledge_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 4,
      },
    },
    {
      $project: {
        text: 1,
        source: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return chunks;
}