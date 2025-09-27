// Helpers
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });
  let body = {};
  try { body = await res.json(); } catch {}
  if (!res.ok) throw new Error(body.error || "Error de red");
  return body;
}

function setAlert(type, msg) {
  const el = document.getElementById("alert");
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.classList.remove("d-none");
}
function clearAlert() {
  const el = document.getElementById("alert");
  el.className = "alert d-none";
  el.textContent = "";
}
function setLoading(isLoading) {
  const btn = document.getElementById("submitBtn");
  const spinner = document.getElementById("btnSpinner");
  btn.disabled = isLoading;
  spinner.classList.toggle("d-none", !isLoading);
}
function validateForm() {
  const form = document.getElementById("loginForm");
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const rememberMe = document.getElementById("rememberMe");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  // Prefill email recordado
  const savedEmail = localStorage.getItem("fj:rememberEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMe.checked = true;
  }

  // Mostrar/ocultar password
  togglePassword.addEventListener("click", () => {
    const isPwd = passwordInput.type === "password";
    passwordInput.type = isPwd ? "text" : "password";
    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
  });

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Guardar/limpiar email recordado
      if (rememberMe.checked) localStorage.setItem("fj:rememberEmail", email);
      else localStorage.removeItem("fj:rememberEmail");

      await postJSON("/api/auth/login", { email, password });
      window.location.href = "/index.html";
    } catch (err) {
      setAlert("danger", err.message);
    } finally {
      setLoading(false);
    }
  });

  // Crear usuario demo
  document.getElementById("seedDemo").addEventListener("click", async () => {
    clearAlert();
    setLoading(true);
    try {
      await postJSON("/api/auth/register", {
        email: "demo@farmacia.com",
        password: "Demo1234!",
        name: "Usuario Demo"
      });
      setAlert("success", "Usuario demo creado. Inicia con demo@farmacia.com / Demo1234!");
      emailInput.value = "demo@farmacia.com";
      passwordInput.value = "Demo1234!";
      rememberMe.checked = true;
      localStorage.setItem("fj:rememberEmail", "demo@farmacia.com");
    } catch (err) {
      setAlert("danger", err.message);
    } finally {
      setLoading(false);
    }
  });
});