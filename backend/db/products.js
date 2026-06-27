import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    userId: String,
    company: String,
    description: String,
    stock_quantity: { type: Number, default: 0 },
    image_url: String
}, { timestamps: true });
export default mongoose.model('products', productsSchema)

