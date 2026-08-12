import { retrieveContext } from "../services/rag.js";
import { generateChatResponse } from "../services/ai.js";

export const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const contextChunks = await retrieveContext(message);
    const contextText = contextChunks.map((c) => c.text).join("\n\n");

    const historyText = history
      .slice(-6)
      .map((h) => `${h.role}: ${h.text}`)
      .join("\n");

    const prompt = `You are a helpful customer support assistant for an e-commerce store called ShopAI.

Answer the user's question using ONLY the context below. If the answer isn't contained in the context, say you don't have that information and suggest contacting support directly. Keep answers concise and friendly.

Context:
${contextText}

Conversation so far:
${historyText}

User question: ${message}`;

    const reply = await generateChatResponse(prompt);

    res.json({ reply, sources: contextChunks.map((c) => c.source) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};