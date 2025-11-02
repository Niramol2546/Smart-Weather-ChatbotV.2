app.post("/api/ask", async (req, res) => {
    try {
      // ต้อง destructure จาก req.body.question
      const { question } = req.body;
  
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, //คีย์จาก .env
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful weather assistant that replies in Thai.",
            },
            {
              role: "user",
              content: question,
            },
          ],
        }),
      });
  
      const data = await response.json();
  
      // แก้ path ของข้อความให้ถูกต้อง
      const reply = data?.choices?.[0]?.message?.content || "ขอโทษค่ะ ระบบไม่สามารถตอบได้ตอนนี้ 😢";
    res.json({ reply });
  
      // ส่งกลับในรูป JSON object
      res.json({ reply });
    } catch (error) {
      console.error("❌ ERROR:", error);
      res.status(500).json({ reply: "เกิดข้อผิดพลาดในการประมวลผล 😢" });
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

  });
  
