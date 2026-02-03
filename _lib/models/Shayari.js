import mongoose from "mongoose";

const shayariSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  moodTags: { type: [String], default: [] },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reactions: {
    "❤️": { type: Number, default: 0 },
    "🔥": { type: Number, default: 0 },
    "🥀": { type: Number, default: 0 },
    "👏": { type: Number, default: 0 },
    "👎": { type: Number, default: 0 },
  },
});

export default mongoose.models.Shayari || mongoose.model("Shayari", shayariSchema);
