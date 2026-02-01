import { connectDB } from "../../_lib/db.js";
import Shayari from "../../_lib/models/Shayari.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    const shayaris = await Shayari.find({ isPublic: true }).sort({
      createdAt: -1,
    });

    res.json(shayaris);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
