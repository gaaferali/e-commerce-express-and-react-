import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
        quantity: { type: Number, default: 1 }
    }]
}, { timestamps: true });

export default mongoose.model('cart', cartSchema);
