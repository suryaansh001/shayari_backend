import { connectDB } from "../../_lib/db.js";
import Shayari from "../../_lib/models/Shayari.js";
import { authenticateToken } from "../../_lib/auth.js";

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

    // Check authentication
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const shayaris = await Shayari.find().sort({ createdAt: -1 });
    res.json(shayaris);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
