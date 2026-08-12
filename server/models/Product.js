import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    embedding: { type: [Number], select: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;