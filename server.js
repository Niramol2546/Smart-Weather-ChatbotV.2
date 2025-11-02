// ---------------------- server.js ----------------------
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ path helper
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ serve static files (index.html, script.js, style.css)
app.use(express.static(__dirname));

// ✅ route แรก: แสดงหน้าเว็บ
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ route สำหรับถาม AI
app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a friendly Thai weather assistant." },
          { role: "user", content: question }
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "ขอโทษค่ะ ระบบไม่สามารถตอบได้ตอนนี้ 😢";
    res.json({ reply });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    res.status(500).json({ reply: "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์ 😢" });
  }
});

// ✅ start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
