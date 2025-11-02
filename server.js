import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

app.post("/api/recommend", async (req, res) => {
  try {
    const { name, skills, interests } = req.body;

    // Create dynamic prompt
    const prompt = `
    You are an AI career counselor.
    Suggest the best 4-5 career paths for a student and employees with these:
    Skills: ${skills}
    Interests: ${interests}
    Provide clear, concise, and friendly advice.
    `;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    let recommendation = result.response.text();
    
    // 🧹 Clean up unwanted symbols and markdown
    recommendation = recommendation
    .replace(/\*\*/g, "")
    .replace(/\*/g, "•")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
  
  recommendation = recommendation
    .split("\n")
    .map(line => `<p>${line.trim()}</p>`)
    .join("");
  
  res.json({ success: true, message: recommendation });
  
    
    // Save user + AI recommendation in MongoDB
    const user = new User({ name, skills, interests, recommendation });
    await user.save();

    res.json({ success: true, message: recommendation });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "AI service error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
