const express = require("express");
const cors = require("cors");
const db = require("./database"); // Importa la instancia de la base de datos
const fetch = require("node-fetch"); // Para llamadas a la API externa

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});

