import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name: String,
    price: String,
    category: String,
    userid: String,
    company: String

})
export default mongoose.model('products', productsSchema)
