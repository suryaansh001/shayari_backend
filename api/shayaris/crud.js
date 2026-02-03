import { connectDB } from "../../_lib/db.js";
import Shayari from "../../_lib/models/Shayari.js";
import { verifyToken } from "../../_lib/auth.js";

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://shayar-suri.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    // Verify auth
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ message: "Invalid token" });
    }

    if (req.method === "POST") {
      // Create
      const { title, content, moodTags, isPublic } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: "Title and content required" });
      }

      const shayari = new Shayari({
        title,
        content,
        moodTags: moodTags || [],
        isPublic: isPublic !== undefined ? isPublic : true,
      });

      await shayari.save();
      return res.status(201).json(shayari);
    } else if (req.method === "PUT") {
      // Update
      const { id } = req.query;
      const { title, content, moodTags, isPublic } = req.body;

      const shayari = await Shayari.findByIdAndUpdate(
        id,
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

      return res.json(shayari);
    } else if (req.method === "DELETE") {
      // Delete
      const { id } = req.query;

      const shayari = await Shayari.findByIdAndDelete(id);

      if (!shayari) {
        return res.status(404).json({ message: "Shayari not found" });
      }

      return res.json({ message: "Shayari deleted successfully" });
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
