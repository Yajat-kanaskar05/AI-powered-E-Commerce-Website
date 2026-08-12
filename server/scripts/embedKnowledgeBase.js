import mongoose from "mongoose";
import dotenv from "dotenv";
import KnowledgeChunk from "../models/KnowledgeChunk.js";
import { getEmbedding } from "../services/ai.js";
import { knowledgeBase } from "../data/knowledgeBase.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  // Clear existing chunks so re-running this script doesn't create duplicates
  await KnowledgeChunk.deleteMany({});
  console.log("Cleared old knowledge chunks");

  for (const entry of knowledgeBase) {
    const embedding = await getEmbedding(entry.text);
    await KnowledgeChunk.create({
      text: entry.text,
      source: entry.source,
      embedding,
    });
    console.log(`Embedded: ${entry.source}`);
  }

  console.log("Knowledge base embedding complete");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});