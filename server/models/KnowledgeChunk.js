import mongoose from "mongoose";

const knowledgeChunkSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    source: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

const KnowledgeChunk = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
export default KnowledgeChunk;