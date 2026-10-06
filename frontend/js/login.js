const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

if (getToken()) {
  window.location.href = "dashboard.html";
}

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  message.textContent = "";
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  message.textContent = "";
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const data = await apiRequest("/auth/login", "POST", { email, password });
    saveSession(data.token, data.user);
    window.location.href = "dashboard.html";
  } catch (err) {
    message.textContent = err.message;
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const data = await apiRequest("/auth/register", "POST", { name, email, password });
    saveSession(data.token, data.user);
    window.location.href = "dashboard.html";
  } catch (err) {
    message.textContent = err.message;
  }
});
