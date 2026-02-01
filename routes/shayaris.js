import express from "express";
import { connectDB } from "../_lib/db.js";
import Shayari from "../_lib/models/Shayari.js";
import { verifyToken } from "../_lib/auth.js";

const router = express.Router();

// Middleware to verify authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid token" });
  }

  req.user = decoded;
  next();
};

// GET /api/shayaris/public - Get all public shayaris
router.get("/public", async (req, res) => {
  try {
    await connectDB();

    const shayaris = await Shayari.find({ isPublic: true }).sort({
      createdAt: -1,
    });

    res.json(shayaris);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/shayaris/all - Get all shayaris (authenticated)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    await connectDB();

    const shayaris = await Shayari.find().sort({ createdAt: -1 });
    res.json(shayaris);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/shayaris/all - Create new shayari (authenticated)
router.post("/all", authenticateToken, async (req, res) => {
  try {
    await connectDB();

    const { title, content, moodTags, isPublic } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    }

    const shayari = new Shayari({
      title,
      content,
      moodTags: moodTags || [],
      isPublic: isPublic || false,
    });

    await shayari.save();
    res.status(201).json(shayari);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/shayaris/:id - Get single shayari by ID
router.get("/:id", async (req, res) => {
  try {
    await connectDB();

    const shayari = await Shayari.findById(req.params.id);

    if (!shayari) {
      return res.status(404).json({ message: "Shayari not found" });
    }

    res.json(shayari);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/shayaris/:id - Update shayari (authenticated)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    await connectDB();

    const { title, content, moodTags, isPublic } = req.body;

    const shayari = await Shayari.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        moodTags,
        isPublic,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!shayari) {
      return res.status(404).json({ message: "Shayari not found" });
    }

    res.json(shayari);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/shayaris/:id - Delete shayari (authenticated)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await connectDB();

    const shayari = await Shayari.findByIdAndDelete(req.params.id);

    if (!shayari) {
      return res.status(404).json({ message: "Shayari not found" });
    }

    res.json({ message: "Shayari deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/shayaris/:id/reaction - Add reaction to shayari
router.post("/:id/reaction", async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    await connectDB();

    const validEmojis = ["❤️", "🔥", "🥀", "👏", "👎"];
    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({ message: "Invalid emoji" });
    }

    const shayari = await Shayari.findById(id);

    if (!shayari) {
      return res.status(404).json({ message: "Shayari not found" });
    }

    // Only allow reactions on public shayaris
    if (!shayari.isPublic) {
      return res.status(403).json({ message: "Cannot react to private shayari" });
    }

    if (!shayari.reactions[emoji]) {
      shayari.reactions[emoji] = 0;
    }

    shayari.reactions[emoji] += 1;
    await shayari.save();

    res.json(shayari);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
