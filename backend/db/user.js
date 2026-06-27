import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    company: String,
    address: String
});
export default mongoose.model('user', userSchema)

