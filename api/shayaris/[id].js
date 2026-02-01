import { connectDB } from "../../_lib/db.js";
import Shayari from "../../_lib/models/Shayari.js";

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
    const { id } = req.query;

    await connectDB();

    const shayari = await Shayari.findById(id);

    if (!shayari) {
      return res.status(404).json({ message: "Shayari not found" });
    }

    // Check if private and no auth
    if (!shayari.isPublic && !req.headers.authorization) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(shayari);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
