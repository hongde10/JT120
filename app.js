const slidesData = [
  {
    title: "The Silence of Light",
    subtitle: "记录光影间隙的哲思",
    image:
      "https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=1920&q=80",
    location: "挪威 · 罗弗敦群岛",
  },
  {
    title: "Breath of Mountains",
    subtitle: "在云海与岩脊之间，倾听风的形状",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80",
    location: "中国 · 川西高原",
  },
  {
    title: "A Slow Horizon",
    subtitle: "海与天在傍晚交换彼此的颜色",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1920&q=80",
    location: "日本 · 镰仓海岸",
  },
  {
    title: "Rain on Glass",
    subtitle: "雨滴在窗上，像未写完的诗句",
    image:
      "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1920&q=80",
    location: "英国 · 伦敦",
  },
  {
    title: "Quiet Departure",
    subtitle: "所有旅程都从一次安静的凝望开始",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80",
    location: "冰岛 · 斯奈山半岛",
  },
];

const slidesRoot = document.getElementById("slides");
const slideTitle = document.getElementById("slideTitle");
const slideSubtitle = document.getElementById("slideSubtitle");
const counter = document.getElementById("counter");
const progressFill = document.getElementById("progressFill");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const nav = document.getElementById("nav");

const aiFab = document.getElementById("aiFab");
const aiPanel = document.getElementById("aiPanel");
const aiCollapse = document.getElementById("aiCollapse");
const aiClear = document.getElementById("aiClear");
const aiMessages = document.getElementById("aiMessages");
const aiForm = document.getElementById("aiForm");
const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");
const mobileGrab = document.getElementById("mobileGrab");

const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const ZHIPU_MODEL = "glm-4-flash";
const ZHIPU_KEY_STORAGE = "zhipu_api_key";
const ZHIPU_API_KEY_DEFAULT = "bcab84dab43044ccace4de718daccfc1.BvDVlCimBXBVeHzx";

let currentIndex = 0;
let autoTimer = null;
const duration = 5000;
let touchStartX = 0;

function initSlides() {
  slidesRoot.innerHTML = slidesData
    .map(
      (item, index) => `
      <div class="slide ${index === 0 ? "active" : ""}">
        <img src="${item.image}" alt="${item.title}" />
      </div>
    `
    )
    .join("");
  updateSlideText();
  resetProgress();
  startAutoPlay();
}

function goToSlide(index) {
  const total = slidesData.length;
  currentIndex = (index + total) % total;
  document.querySelectorAll(".slide").forEach((slide, i) => {
    slide.classList.toggle("active", i === currentIndex);
  });
  updateSlideText();
  resetProgress();
}

function nextSlide() {
  goToSlide(currentIndex + 1);
}

function prevSlide() {
  goToSlide(currentIndex - 1);
}

function updateSlideText() {
  const item = slidesData[currentIndex];
  slideTitle.textContent = item.title;
  slideSubtitle.textContent = item.subtitle;
  const displayIndex = String(currentIndex + 1).padStart(2, "0");
  counter.textContent = `${displayIndex} / ${String(slidesData.length).padStart(2, "0")}`;
}

function resetProgress() {
  progressFill.classList.remove("animating");
  void progressFill.offsetWidth;
  progressFill.classList.add("animating");
}

function startAutoPlay() {
  stopAutoPlay();
  autoTimer = setInterval(nextSlide, duration);
}

function stopAutoPlay() {
  if (autoTimer) clearInterval(autoTimer);
}

prevBtn.addEventListener("click", () => {
  prevSlide();
  startAutoPlay();
});

nextBtn.addEventListener("click", () => {
  nextSlide();
  startAutoPlay();
});

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 100);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

function addMessage(role, text, typing = false) {
  const msg = document.createElement("div");
  msg.className = `msg ${role}`;

  if (role === "ai") {
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = "A";
    msg.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  msg.appendChild(bubble);
  aiMessages.appendChild(msg);
  aiMessages.scrollTop = aiMessages.scrollHeight;

  if (!typing) {
    bubble.textContent = text;
    return;
  }

  let i = 0;
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "_";
  bubble.appendChild(cursor);

  const timer = setInterval(() => {
    if (i >= text.length) {
      cursor.remove();
      clearInterval(timer);
      return;
    }
    bubble.insertBefore(document.createTextNode(text[i]), cursor);
    i += 1;
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }, 20);
}

function replyFor(inputRaw) {
  const input = inputRaw.toLowerCase();

  if (input.includes("切换下一张") || input.includes("下一张") || input.includes("看看风景")) {
    nextSlide();
    startAutoPlay();
    return "好的，为您切换。";
  }

  if (input.includes("第一张") && input.includes("在哪")) {
    return `第一张照片拍摄于 ${slidesData[0].location}。`;
  }

  if (input.includes("第") && input.includes("张") && input.includes("在哪")) {
    const match = input.match(/第(\d+)张/);
    if (match) {
      const idx = Number(match[1]) - 1;
      if (slidesData[idx]) return `第${match[1]}张拍摄于 ${slidesData[idx].location}。`;
    }
  }

  if (input.includes("你是谁") || input.includes("介绍")) {
    return "我是这个个人站的本地 AI 助手，可以帮你浏览作品、切换轮播，并回答照片相关信息。";
  }

  if (input.includes("作品") || input.includes("风格")) {
    return "整体风格偏向安静、克制与电影感，强调光线与情绪之间的细微关系。";
  }

  return null;
}

function getZhipuApiKey() {
  return localStorage.getItem(ZHIPU_KEY_STORAGE) || ZHIPU_API_KEY_DEFAULT;
}

async function callZhipu(userText) {
  const apiKey = getZhipuApiKey();
  if (!apiKey) {
    return "未配置智谱 API Key。";
  }

  const systemPrompt =
    "你是个人摄影网站的 AI 助手。回答简洁、温柔、有审美感。优先围绕作品、摄影、网站浏览建议作答。";

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: ZHIPU_MODEL,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Zhipu API error:", response.status, errText);
      return `智谱接口请求失败（${response.status}）。请检查 Key、额度或域名权限。`;
    }

    const data = await response.json();
    return (
      data?.choices?.[0]?.message?.content ||
      "我已收到你的问题，但暂时没有生成有效回复。"
    );
  } catch (error) {
    console.error("Zhipu network error:", error);
    return "连接智谱接口失败。请检查网络，若浏览器跨域受限，建议加一个后端代理。";
  }
}

function openPanel() {
  aiPanel.classList.add("open");
  aiPanel.setAttribute("aria-hidden", "false");
  aiInput.focus();
}

function closePanel() {
  aiPanel.classList.remove("open");
  aiPanel.setAttribute("aria-hidden", "true");
}

aiFab.addEventListener("click", openPanel);
aiCollapse.addEventListener("click", closePanel);

mobileGrab.addEventListener("click", closePanel);

aiClear.addEventListener("click", () => {
  aiMessages.innerHTML = "";
  addMessage("ai", "你好，我在。想先了解哪张作品？", true);
});

aiInput.addEventListener("input", () => {
  const enabled = aiInput.value.trim().length > 0;
  sendBtn.disabled = !enabled;
  sendBtn.classList.toggle("enabled", enabled);
});

aiForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = aiInput.value.trim();
  if (!text) return;
  addMessage("user", text);
  aiInput.value = "";
  sendBtn.disabled = true;
  sendBtn.classList.remove("enabled");

  const localAnswer = replyFor(text);
  if (localAnswer) {
    setTimeout(() => addMessage("ai", localAnswer, true), 250);
    return;
  }

  const loadingHint = "让我想一下";
  addMessage("ai", `${loadingHint}...`, true);
  const answer = await callZhipu(text);
  const aiLast = aiMessages.lastElementChild;
  if (aiLast) aiLast.remove();
  addMessage("ai", answer, true);
});

function bindTouchSlide() {
  const hero = document.getElementById("hero");
  hero.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  });
  hero.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 35) return;
    if (dx < 0) nextSlide();
    else prevSlide();
    startAutoPlay();
  });
}

initSlides();
bindTouchSlide();
addMessage("ai", "你好，我在。你可以让我切换下一张图片，或问我拍摄地点。", true);
