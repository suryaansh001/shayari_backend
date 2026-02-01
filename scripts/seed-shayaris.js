import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Shayari from "../_lib/models/Shayari.js";
import { connectDB } from "../_lib/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Helper to generate mood tags based on content
function generateMoodTags(content) {
  const moodKeywords = {
    "Heartbreak": ["dil", "tut", "khun", "bewafai", "judai", "dukh"],
    "Love & Longing": ["ishq", "muhabbat", "pyaar", "yaad", "intezaar", "nasha", "chahat"],
    "Melancholy": ["tanha", "akela", "khomoshi", "raat", "dhuaan", "udaasi"],
    "Fire & Passion": ["jalti", "aag", "cigarette", "nasha", "jalti hui"],
    "Betrayal": ["bewafai", "dagha", "khianaat", "dhokha"],
    "Solitude": ["tanha", "akela", "sukoon", "raat bhar"],
  };

  const tags = [];
  const lowerContent = content.toLowerCase();

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some((kw) => lowerContent.includes(kw))) {
      tags.push(mood);
    }
  }

  if (tags.length === 0) tags.push("Poetry");
  return tags;
}

// Helper to generate title from content
function generateTitle(content) {
  // Get all non-empty lines and skip single words (which are remnants from split)
  const lines = content
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && l.length > 2 && l.split(/\s+/).length > 1);
  
  const firstLine = lines[0]?.substring(0, 50).trim() || "Untitled";

  const titleMappings = {
    "main apne ghaaw": "Bewafa Ishq",
    "dost samajh": "Cigarette Aur Tum",
    "zindagi k diye": "Adhoora Marham",
    "teri bewafai": "Jhootha Kirdaar",
    "kamre ka": "Ek Tarfa Wafa",
    "na peene": "Aankhon Ka Nasha",
    "tere jaane": "Intezaar Zinda Hai",
    "itna kyu": "Jalan Bhara Sach",
    "woh kisi": "Bas Aazmaish",
  };

  const lowerFirstLine = firstLine.toLowerCase();
  for (const [keyword, title] of Object.entries(titleMappings)) {
    if (lowerFirstLine.includes(keyword)) {
      return title;
    }
  }

  return firstLine;
}

async function seedDatabase() {
  try {
    await connectDB();
    console.log("🔌 Connected to database");

    // Read shayaris.txt
    const filePath = path.join(process.cwd(), "../midnight-muse/shayris.txt");
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, "utf-8");

    // Split by numbering pattern - handle both "1)" and "1)Title" formats
    const shayaris = content
      .split(/\n\s*\d+[A-Za-z]*\)/)
      .filter((s) => s.trim() && s.length > 10)
      .map((s) => s.trim());

    console.log(`📖 Found ${shayaris.length} shayaris to seed`);

    // Clear existing shayaris (optional - comment out to keep existing)
    await Shayari.deleteMany({});
    console.log("🗑️  Cleared existing shayaris");

    const createdShayaris = [];

    for (let i = 0; i < shayaris.length; i++) {
      const shayariContent = shayaris[i];
      const title = generateTitle(shayariContent);
      const moodTags = generateMoodTags(shayariContent);
      
      // Check if shayari is marked as personal/private
      const isPrivate = shayariContent.toLowerCase().includes("personal") || 
                       shayariContent.toLowerCase().includes("not for public");

      const shayariDoc = new Shayari({
        title,
        content: shayariContent,
        moodTags,
        isPublic: !isPrivate, // Mark as private if contains personal/not for public
        reactions: {
          "❤️": 0,
          "🔥": 0,
          "🥀": 0,
          "👏": 0,
          "👎": 0,
        },
      });

      await shayariDoc.save();
      createdShayaris.push(shayariDoc);
      const statusIcon = isPrivate ? "🔒" : "🌍";
      console.log(`✅ ${i + 1}. "${title}" [${statusIcon}] - Tags: ${moodTags.join(", ")}`);
    }

    console.log(`\n✨ Successfully seeded ${createdShayaris.length} shayaris!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
