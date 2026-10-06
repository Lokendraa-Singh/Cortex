if (!getToken()) {
  window.location.href = "index.html";
}

const user = getUser();
document.getElementById("userNameDisplay").textContent = user ? `Hi, ${user.name}` : "";

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

let currentPage = 1;
let searchTimeout = null;

// ---------- STATS ----------
async function loadStats() {
  try {
    const stats = await apiRequest("/problems/stats");
    document.getElementById("currentStreak").textContent = `${stats.currentStreak} 🔥`;
    document.getElementById("longestStreak").textContent = stats.longestStreak;
    document.getElementById("dueTodayCount").textContent = stats.dueTodayCount;
    document.getElementById("totalProblems").textContent = stats.totalProblems;

    const topicDiv = document.getElementById("topicBreakdown");
    topicDiv.innerHTML = "";
    if (stats.topicBreakdown.length === 0) {
      topicDiv.innerHTML = `<p class="empty-msg">Add some problems to see your topic breakdown</p>`;
    } else {
      stats.topicBreakdown.forEach((t) => {
        const pill = document.createElement("span");
        pill.className = "topic-pill";
        pill.textContent = `${t._id}: ${t.count}`;
        topicDiv.appendChild(pill);
      });
    }
  } catch (err) {
    console.error(err.message);
  }
}

// ---------- DUE TODAY ----------
async function loadDueToday() {
  try {
    const data = await apiRequest("/problems/due-today");
    const list = document.getElementById("dueTodayList");
    list.innerHTML = "";

    if (data.dueProblems.length === 0) {
      list.innerHTML = `<p class="empty-msg">Nothing due today. Add problems or come back tomorrow 🎉</p>`;
      return;
    }

    data.dueProblems.forEach((p) => {
      const item = document.createElement("div");
      item.className = "due-item";
      item.innerHTML = `
        <div class="info">
          <strong>${p.title}</strong>
          <span>${p.topic} • ${p.difficulty} • Revised ${p.timesRevised}x</span>
        </div>
        <div class="actions">
          <button class="remembered-btn" onclick="reviseProblem('${p._id}', 'remembered')">✓ Remembered</button>
          <button class="forgot-btn" onclick="reviseProblem('${p._id}', 'forgot')">✗ Forgot</button>
        </div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    console.error(err.message);
  }
}

async function reviseProblem(id, result) {
  try {
    await apiRequest(`/problems/${id}/revise`, "PATCH", { result });
    loadDueToday();
    loadStats();
    loadAllProblems(currentPage);
  } catch (err) {
    alert(err.message);
  }
}

// ---------- ADD PROBLEM ----------
document.getElementById("problemForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: document.getElementById("title").value,
    topic: document.getElementById("topic").value,
    difficulty: document.getElementById("difficulty").value,
    link: document.getElementById("link").value,
    notes: document.getElementById("notes").value,
  };

  const submitBtn = e.target.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Adding...";

  try {
    await apiRequest("/problems", "POST", payload);
    document.getElementById("problemForm").reset();
    loadStats();
    loadDueToday();
    loadAllProblems();
  } catch (err) {
    alert(err.message);
  } finally {
    // button ko wapas enable karna zaroori hai, warna user dubara add nahi kar payega
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// ---------- AI CODE REVIEW ----------
document.getElementById("aiReviewBtn").addEventListener("click", async () => {
  const code = document.getElementById("aiCode").value;
  const problemTitle = document.getElementById("aiProblemTitle").value;
  const feedbackBox = document.getElementById("aiFeedback");
  const aiBtn = document.getElementById("aiReviewBtn");

  if (!code.trim()) {
    alert("Please paste your code first");
    return;
  }

  feedbackBox.classList.remove("hidden");
  feedbackBox.textContent = "Analyzing your code...";
  aiBtn.disabled = true;

  try {
    const data = await apiRequest("/ai/review", "POST", { code, problemTitle });
    feedbackBox.textContent = data.feedback;
  } catch (err) {
    feedbackBox.textContent = `Error: ${err.message}`;
  } finally {
    aiBtn.disabled = false;
  }
});

// ---------- ALL PROBLEMS TABLE ----------
async function loadAllProblems(page = 1, search = "") {
  currentPage = page;
  try {
    const data = await apiRequest(`/problems?page=${page}&limit=8&search=${encodeURIComponent(search)}`);
    renderTable(data.problems);
    renderPagination(data.totalPages, data.currentPage);
  } catch (err) {
    console.error(err.message);
  }
}

function renderTable(problems) {
  const tbody = document.getElementById("allProblemsBody");
  tbody.innerHTML = "";

  if (problems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#9ca3af;">No problems yet</td></tr>`;
    return;
  }

  problems.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.title}</td>
      <td>${p.topic}</td>
      <td>${p.difficulty}</td>
      <td>${new Date(p.nextRevisionDate).toLocaleDateString()}</td>
      <td>${p.timesRevised}</td>
      <td><button class="action-btn" onclick="deleteProblem('${p._id}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderPagination(totalPages, current) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === current) btn.classList.add("active");
    btn.addEventListener("click", () => loadAllProblems(i, document.getElementById("searchInput").value));
    pagination.appendChild(btn);
  }
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadAllProblems(1, e.target.value);
  }, 400);
});

async function deleteProblem(id) {
  if (!confirm("Delete this problem?")) return;
  try {
    await apiRequest(`/problems/${id}`, "DELETE");
    loadAllProblems(currentPage);
    loadStats();
    loadDueToday();
  } catch (err) {
    alert(err.message);
  }
}

// page load hote hi sab kuch ek saath fetch kar lete hain
loadStats();
loadDueToday();
loadAllProblems();
