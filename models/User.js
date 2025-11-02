import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skills: { type: String, required: true },
  interests: { type: String, required: true },
  recommendation: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
