// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------
// ✅ ส่วนนี้คือจุดสำคัญ! ให้เพิ่มลงไป
// ----------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// เสิร์ฟไฟล์ทั้งหมดจากโฟลเดอร์ปัจจุบัน (รวม index.html)
app.use(express.static(__dirname));

// route หลัก "/" → เปิดหน้า index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ----------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
