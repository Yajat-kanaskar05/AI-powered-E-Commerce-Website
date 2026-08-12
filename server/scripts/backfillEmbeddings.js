import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { getEmbedding } from "../services/ai.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const products = await Product.find({}); // select: false is bypassed since we're not filtering by embedding
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    const text = `${product.name}. ${product.description}. Category: ${product.category}`;
    const embedding = await getEmbedding(text);
    product.embedding = embedding;
    await product.save();
    console.log(`Embedded: ${product.name}`);
  }

  console.log("Backfill complete");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});