import Product from "../models/Product.js";
import { getEmbedding } from "../services/ai.js";

// GET /api/products  (public, with pagination/filtering)
export const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/products  (admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images } = req.body;

    const textForEmbedding = `${name}. ${description}. Category: ${category}`;
    const embedding = await getEmbedding(textForEmbedding);

    const product = await Product.create({
      name, description, price, category, stock, images, embedding,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/products/:id  (admin only)
export const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const updates = { ...req.body };

    if (updates.name || updates.description || updates.category) {
      const textForEmbedding = `${updates.name || existing.name}. ${updates.description || existing.description}. Category: ${updates.category || existing.category}`;
      updates.embedding = await getEmbedding(textForEmbedding);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/products/:id  (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/products/search-ai
export const searchProductsAI = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query parameter 'q' is required" });

    const queryEmbedding = await getEmbedding(q);

    const results = await Product.aggregate([
      {
        $vectorSearch: {
          index: "product_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          category: 1,
          images: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    if (results.length === 0) {
      return res.json([]);
    }

    const topScore = results[0].score;

    const RELATIVE_GAP = 0.04;
    const MIN_ABSOLUTE_SCORE = 0.75;

    const filtered = results.filter(
      (r) => r.score >= topScore - RELATIVE_GAP && r.score >= MIN_ABSOLUTE_SCORE
    );

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};