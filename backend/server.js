const session = require("express-session");
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database"); // Importa la instancia de la base de datos
const fetch = require("node-fetch"); // Para llamadas a la API externa

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



// Sesiones para autenticación (usar una variable de entorno SESSION_SECRET en producción)
// Sesión (pon un secreto robusto en producción)
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false } // true si usas HTTPS
}));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));
// Rutas de autenticación
//app.use("/api/auth", require("./auth/authRoutes")); COMENTADOOOOO

// Ruta para validar stock de medicamentos
app.post("/validar-stock", (req, res) => {
  const { medicamentos } = req.body;
  if (!medicamentos || !Array.isArray(medicamentos)) {
    return res.status(400).json({ error: "Se espera un array de medicamentos." });
  }

  const resultados = [];
  let processedCount = 0;

  if (medicamentos.length === 0) {
    return res.json([]);
  }

  medicamentos.forEach((med) => {
    db.get(
      "SELECT stock FROM medicamentos WHERE nombre LIKE ?",
      [`%${med}%`],
      (err, row) => {
        if (err) {
          console.error("Error al consultar DB: " + err.message);
          resultados.push({
            nombre: med,
            disponible: false,
            error: "Error en la base de datos",
          });
        } else {
          resultados.push({
            nombre: med,
            disponible: row ? row.stock > 0 : false,
          });
        }
        processedCount++;
        if (processedCount === medicamentos.length) {
          res.json(resultados);
        }
      }
    );
  });
});

// Ruta para normalizar receta con IA
app.post("/normalizar-receta", async (req, res) => {
  const { texto } = req.body;
  if (!texto) {
    return res.status(400).json({ error: "Se requiere texto para normalizar." });
  }

  try {
    const respuesta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openchat/openchat-7b", // Puedes cambiar a otro modelo gratuito si lo deseas
        messages: [
          { role: "system", content: "Eres un asistente médico que normaliza nombres de medicamentos y corrige errores de OCR." },
          { role: "user", content: `Corrige, normaliza y estandariza dosis/presentaciones de esta receta: ${texto}` },
        ],
      }),
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json();
      console.error("Error de la API de OpenRouter:", errorData);
      return res.status(respuesta.status).json({ error: "Error al comunicarse con la API de IA", details: errorData });
    }

    const data = await respuesta.json();
    res.json(data.choices[0].message.content);
  } catch (error) {
    console.error("Error al normalizar receta con IA:", error);
    res.status(500).json({ error: "Error interno del servidor al procesar IA." });
  }
});

// Ruta para servir la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});

// --- AUTH INLINE START ---
function requireLogin(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: "No autenticado" });
}

// Helpers Promesa para SQLite
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Asegurar tabla users
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Registro
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email y password son requeridos" });
    const emailNorm = String(email).trim().toLowerCase();
    const existing = await dbGet("SELECT id FROM users WHERE email = ?", [emailNorm]);
    if (existing) return res.status(409).json({ error: "El usuario ya existe" });
    const hash = bcrypt.hashSync(password, 10);
    const r = await dbRun("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", [emailNorm, hash, name || null]);
    req.session.userId = r.lastID;
    res.status(201).json({ user: { id: r.lastID, email: emailNorm, name: name || null, role: "user" } });
  } catch (e) {
    console.error("register error", e);
    res.status(500).json({ error: "Error creando usuario" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email y password son requeridos" });
    const user = await dbGet("SELECT * FROM users WHERE email = ?", [String(email).trim().toLowerCase()]);
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });
    req.session.userId = user.id;
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, created_at: user.created_at } });
  } catch (e) {
    console.error("login error", e);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Estado de sesión
app.get("/api/auth/me", requireLogin, async (req, res) => {
  try {
    const u = await dbGet("SELECT id, email, name, role, created_at FROM users WHERE id = ?", [req.session.userId]);
    if (!u) return res.status(404).json({ error: "No encontrado" });
    res.json({ user: u });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  try {
    req.session.destroy(() => res.json({ ok: true }));
  } catch {
    res.json({ ok: true });
  }
});

// Ejemplo protegido
app.get("/api/auth/secure/ping", requireLogin, (req, res) => res.json({ ok: true }));
// --- AUTH INLINE END ---