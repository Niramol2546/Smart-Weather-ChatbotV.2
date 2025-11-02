const OPENWEATHER_KEY = "362ddf4f147d393275663a94ca9b6384";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chartCanvas = document.getElementById("weatherChart");

// ---------------------- INITIALIZE ----------------------
localStorage.removeItem("chatHistory"); // ✅ เคลียร์ประวัติทุกครั้งที่รีเฟรช
let chatHistory = [];
chatBox.innerHTML = ""; // เริ่มต้นใหม่ ไม่มีข้อความเก่า


sendBtn.addEventListener("click", handleSend);
input.addEventListener("keypress", (e) => { if (e.key === "Enter") handleSend(); });

// ---------------------- MAIN CHAT ----------------------
function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  chatHistory.push(msg.outerHTML);
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

async function handleSend() {
  const userText = input.value.trim();
  if (!userText) return;
  appendMessage("user", userText);
  input.value = "";

  appendMessage("bot", "⏳ กำลังพิมพ์...");

  const location = extractLocation(userText) || "Bangkok";
  const weather = await getWeather(location);
  const forecast = await getForecast(location);

  const reply = await askLLM_OpenRouter(userText, weather, forecast, location);
  
  chatBox.lastChild.innerHTML = reply;

  renderChart(forecast); // แสดงกราฟ
  setTheme(weather); // เปลี่ยนธีม
}

// ---------------------- LOCATION DETECTION ----------------------
function extractLocation(text) {
    const cityList = [
      "Bangkok", "Chiang Mai", "Chiang Rai", "Phuket", "Krabi", "Surat Thani",
      "Chonburi", "Pattaya", "Khon Kaen", "Udon Thani", "Nakhon Ratchasima",
      "Nakhon Sawan", "Lopburi", "Ayutthaya", "Suphan Buri", "Ratchaburi",
      "Kanchanaburi", "Phetchaburi", "Prachuap Khiri Khan", "Hua Hin", "Nakhon Pathom",
      "Samut Prakan", "Samut Sakhon", "Nonthaburi", "Pathum Thani", "Saraburi",
      "Rayong", "Chanthaburi", "Trat", "Nakhon Si Thammarat", "Songkhla", "Hat Yai",
      "Trang", "Pattani", "Yala", "Narathiwat", "Lampang", "Lamphun", "Phayao",
      "Nan", "Phrae", "Uttaradit", "Tak", "Mae Hong Son", "Sukhothai", "Phitsanulok",
      "Phichit", "Kamphaeng Phet", "Nakhon Phanom", "Sakon Nakhon", "Mukdahan",
      "Kalasin", "Roi Et", "Maha Sarakham", "Buriram", "Surin", "Si Sa Ket", "Amnat Charoen",
      "Yasothon", "Ubon Ratchathani", "Nong Khai", "Nong Bua Lamphu", "Chaiyaphum",
      "Nakhon Nayok", "Prachinburi", "Chachoengsao", "Samut Songkhram", "Ang Thong",
      "Sing Buri", "Chainat", "Phuket", "Ranong", "Chumphon", "Satun"
    ];
  
    text = text.toLowerCase();
  
    // ตรวจทั้งชื่ออังกฤษและชื่อไทย
    const thaiCities = [
      "กรุงเทพ", "เชียงใหม่", "เชียงราย", "ภูเก็ต", "กระบี่", "สุราษฎร์ธานี", "ชลบุรี", "พัทยา", "ขอนแก่น", "อุดรธานี", "นครราชสีมา",
      "นครสวรรค์", "ลพบุรี", "อยุธยา", "สุพรรณบุรี", "ราชบุรี", "กาญจนบุรี", "เพชรบุรี", "ประจวบคีรีขันธ์", "หัวหิน", "นครปฐม",
      "สมุทรปราการ", "สมุทรสาคร", "นนทบุรี", "ปทุมธานี", "สระบุรี", "ระยอง", "จันทบุรี", "ตราด", "นครศรีธรรมราช", "สงขลา", "หาดใหญ่",
      "ตรัง", "ปัตตานี", "ยะลา", "นราธิวาส", "ลำปาง", "ลำพูน", "พะเยา", "น่าน", "แพร่", "อุตรดิตถ์", "ตาก", "แม่ฮ่องสอน", "สุโขทัย",
      "พิษณุโลก", "พิจิตร", "กำแพงเพชร", "นครพนม", "สกลนคร", "มุกดาหาร", "กาฬสินธุ์", "ร้อยเอ็ด", "มหาสารคาม", "บุรีรัมย์", "สุรินทร์",
      "ศรีสะเกษ", "อำนาจเจริญ", "ยโสธร", "อุบลราชธานี", "หนองคาย", "หนองบัวลำภู", "ชัยภูมิ", "นครนายก", "ปราจีนบุรี", "ฉะเชิงเทรา",
      "สมุทรสงคราม", "อ่างทอง", "สิงห์บุรี", "ชัยนาท", "ระนอง", "ชุมพร", "สตูล"
    ];
  
    for (let city of cityList) {
      if (text.includes(city.toLowerCase())) return city;
    }
    for (let city of thaiCities) {
      if (text.includes(city)) return city;
    }
  
    return null;
  }
  

// ---------------------- WEATHER API ----------------------
async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=th&appid=${OPENWEATHER_KEY}`;
  const res = await fetch(url);
  return await res.json();
}

async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=th&appid=${OPENWEATHER_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.list.slice(0, 6); // 3 วันถัดไป
}

// ---------------------- THEME SWITCHER ----------------------
function setTheme(weather) {
  const desc = weather.weather[0].main.toLowerCase();
  if (desc.includes("rain")) document.body.className = "rainy";
  else if (desc.includes("cloud")) document.body.className = "cloudy";
  else if (desc.includes("clear")) document.body.className = "sunny";
  else document.body.className = "night";
}

// ---------------------- AI RESPONSE ----------------------
async function askLLM_OpenRouter(userText, weatherInfo, forecast, city) {
  const icon = weatherInfo.weather[0].icon;
  const temp = weatherInfo.main.temp;
  const desc = weatherInfo.weather[0].description;

  const forecastSummary = forecast.map(f =>
    `${f.dt_txt.split(" ")[0]} ${f.weather[0].description} ${f.main.temp}°C`
  ).join("\n");

  const prompt = `
  ผู้ใช้ถามว่า: ${userText}
  เมือง: ${city}
  สภาพอากาศตอนนี้: ${desc}, ${temp}°C
  พยากรณ์ล่วงหน้า 3 วัน:
  ${forecastSummary}
  ช่วยตอบเป็นภาษาคนไทยให้เป็นธรรมชาติแบบ Chatbot เป็นมิตร
  ใส่อีโมจิที่เหมาะกับอากาศ และแนะนำกิจกรรมเหมาะสม 1 อย่าง
  `;

  // ✅ เรียก API ผ่านเซิร์ฟเวอร์แทน openrouter โดยตรง
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: prompt }),
  });

  const data = await res.json();
  const aiReply = data.reply || "ขอโทษค่ะ ระบบไม่สามารถตอบได้ตอนนี้ 😢";

  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  return `<img src="${iconUrl}" width="50"><br>${aiReply}`;
}


// ---------------------- GRAPH ----------------------
let currentChart;

function renderChart(forecast) {
  if (!forecast || !Array.isArray(forecast)) {
    console.warn("⚠️ ไม่มีข้อมูลพยากรณ์");
    return;
  }

  const chartContainer = document.querySelector(".chart-container");
  const chartCanvas = document.getElementById("weatherChart");
  if (!chartCanvas) {
    console.error("❌ ไม่พบ weatherChart element");
    return;
  }

  chartContainer.style.display = "block"; // ✅ แสดง container

  const labels = forecast.map(f => f.dt_txt.split(" ")[0]);
  const temps = forecast.map(f => f.main.temp);

  // ✅ เคลียร์กราฟเก่าถ้ามี
  if (currentChart) {
    currentChart.destroy();
  }

  const ctx = chartCanvas.getContext("2d");
  currentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "อุณหภูมิ (°C)",
        data: temps,
        borderColor: "#007BFF",
        backgroundColor: "rgba(0, 123, 255, 0.25)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#0066cc"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000, easing: "easeInOutCubic" },
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false } }
    }
  });
}




