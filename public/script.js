/* ============================================================
   GeoBot – Frontend Script
   Handles chat UI, API calls, scoring, and session management
   ============================================================ */

(function () {
  "use strict";

  /* ---------- State ---------- */
  const state = {
    sessionId: generateSessionId(),
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    isLoading: false,
  };

  /* ---------- DOM Refs ---------- */
  const chatMessages  = document.getElementById("chatMessages");
  const userInput     = document.getElementById("userInput");
  const sendBtn       = document.getElementById("sendBtn");
  const restartBtn    = document.getElementById("restartBtn");
  const menuBtn       = document.getElementById("menuBtn");
  const sidebar       = document.querySelector(".sidebar");
  const statusDot     = document.getElementById("statusDot");
  const statusText    = document.getElementById("statusText");
  const correctEl     = document.getElementById("correctCount");
  const wrongEl       = document.getElementById("wrongCount");
  const streakEl      = document.getElementById("streakCount");
  const accuracyPct   = document.getElementById("accuracyPct");
  const accuracyFill  = document.getElementById("accuracyFill");
  const toast         = document.getElementById("toast");

  /* ---------- Utility ---------- */
  function generateSessionId() {
    return "sess_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* Convert plain text with newlines to HTML and make emojis pop */
  function formatMessage(text) {
    return escapeHtml(text)
      .replace(/\n/g, "<br>")
      .replace(/(✅)/g, '<span class="emoji-correct">$1</span>')
      .replace(/(❌)/g, '<span class="emoji-wrong">$1</span>');
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg, duration = 2800) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
  }

  /* ---------- Status ---------- */
  function setStatus(state) {
    statusDot.className = "status-dot " + state;
    const labels = { online: "Online", loading: "Thinking…", offline: "Offline" };
    statusText.textContent = labels[state] || state;
  }

  /* ---------- Score ---------- */
  function updateScore() {
    correctEl.textContent = state.correct;
    wrongEl.textContent   = state.wrong;
    streakEl.textContent  = state.streak;

    const total = state.correct + state.wrong;
    if (total === 0) {
      accuracyPct.textContent  = "—";
      accuracyFill.style.width = "0%";
    } else {
      const pct = Math.round((state.correct / total) * 100);
      accuracyPct.textContent  = pct + "%";
      accuracyFill.style.width = pct + "%";
    }
  }

  /* Detect correct/wrong from bot reply */
  function parseScoreFromReply(text) {
    const hasCorrect = /correct\s*✅|✅\s*correct/i.test(text) || text.includes("✅");
    const hasWrong   = /wrong\s*❌|❌\s*wrong|incorrect\s*❌|❌\s*incorrect/i.test(text) || text.includes("❌");

    if (hasCorrect && !hasWrong) {
      state.correct++;
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      if (state.streak > 1) showToast(`🔥 ${state.streak} in a row!`);
      return "correct";
    } else if (hasWrong) {
      state.wrong++;
      state.streak = 0;
      return "wrong";
    }
    return null;
  }

  /* ---------- Message Rendering ---------- */
  function appendMessage(role, text, bubbleClass = "") {
    const isBot   = role === "bot";
    const wrapper = document.createElement("div");
    wrapper.className = `msg ${role}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = "msg-avatar";
    avatarEl.textContent = isBot ? "🌍" : "👤";

    const inner = document.createElement("div");

    const bubbleEl = document.createElement("div");
    bubbleEl.className = `msg-bubble ${bubbleClass}`.trim();
    bubbleEl.innerHTML = formatMessage(text);

    const timeEl = document.createElement("div");
    timeEl.className = "msg-time";
    timeEl.textContent = formatTime(new Date());

    inner.appendChild(bubbleEl);
    inner.appendChild(timeEl);

    wrapper.appendChild(avatarEl);
    wrapper.appendChild(inner);

    chatMessages.appendChild(wrapper);
    scrollToBottom();
    return bubbleEl;
  }

  function scrollToBottom(smooth = true) {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });
  }

  /* ---------- Typing Indicator ---------- */
  function showTyping() {
    const wrap = document.createElement("div");
    wrap.className = "typing-indicator";
    wrap.id = "typingIndicator";

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = "🌍";

    const dots = document.createElement("div");
    dots.className = "typing-dots";
    dots.innerHTML = "<span></span><span></span><span></span>";

    wrap.appendChild(avatar);
    wrap.appendChild(dots);
    chatMessages.appendChild(wrap);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
  }

  /* ---------- API Calls ---------- */
  async function startSession() {
    setStatus("loading");
    showTyping();
    try {
      const res  = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: state.sessionId }),
      });
      const data = await res.json();
      hideTyping();

      if (data.error) {
        appendMessage("bot", "⚠️ " + data.error);
        setStatus("offline");
      } else {
        appendMessage("bot", data.reply);
        setStatus("online");
      }
    } catch (err) {
      hideTyping();
      appendMessage("bot", "⚠️ Could not connect to the server. Make sure it's running!");
      setStatus("offline");
    }
  }

  async function sendMessage(text) {
    if (state.isLoading) return;
    state.isLoading = true;

    appendMessage("user", text);
    sendBtn.disabled = true;
    setStatus("loading");
    showTyping();

    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: state.sessionId }),
      });
      const data = await res.json();
      hideTyping();

      if (data.error) {
        appendMessage("bot", "⚠️ " + data.error);
        setStatus("offline");
      } else {
        const scoreType = parseScoreFromReply(data.reply);
        appendMessage("bot", data.reply, scoreType || "");
        updateScore();
        setStatus("online");
      }
    } catch (err) {
      hideTyping();
      appendMessage("bot", "⚠️ Network error. Please try again.");
      setStatus("offline");
    } finally {
      state.isLoading = false;
      sendBtn.disabled = false;
      userInput.focus();
    }
  }

  /* ---------- Handle Submit ---------- */
  function handleSend() {
    const text = userInput.value.trim();
    if (!text || state.isLoading) return;
    userInput.value = "";
    autoResize();
    sendMessage(text);
  }

  /* ---------- Restart ---------- */
  function restartQuiz() {
    state.sessionId = generateSessionId();
    state.correct   = 0;
    state.wrong     = 0;
    state.streak    = 0;
    state.bestStreak = 0;

    chatMessages.innerHTML = "";
    updateScore();
    showToast("🔄 Quiz restarted! Let's go again!");
    startSession();
  }

  /* ---------- Auto-resize textarea ---------- */
  function autoResize() {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
  }

  /* ---------- Sidebar Toggle (mobile) ---------- */
  function toggleSidebar() {
    sidebar.classList.toggle("open");
  }

  /* ---------- Event Listeners ---------- */
  sendBtn.addEventListener("click", handleSend);

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  userInput.addEventListener("input", autoResize);

  restartBtn.addEventListener("click", restartQuiz);

  menuBtn.addEventListener("click", toggleSidebar);

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== menuBtn
    ) {
      sidebar.classList.remove("open");
    }
  });

  /* ---------- Inject emoji styles ---------- */
  const emojiStyle = document.createElement("style");
  emojiStyle.textContent = `
    .emoji-correct { color: #00e5a0; font-weight: 700; }
    .emoji-wrong   { color: #ff4f6e; font-weight: 700; }
  `;
  document.head.appendChild(emojiStyle);

  /* ---------- Init ---------- */
  setStatus("loading");
  updateScore();
  startSession();
  userInput.focus();

})();
