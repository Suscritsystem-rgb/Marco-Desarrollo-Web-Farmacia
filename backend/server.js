const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database"); // Importa la instancia de la base de datos
const fetch = require("node-fetch"); // Para llamadas a la API externa

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Array temporal para simular carrito en memoria (en producción sería base de datos)
let carritoItems = [];

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

// RUTAS DEL CARRITO
// Obtener items del carrito
app.get("/api/carrito", (req, res) => {
  res.json(carritoItems);
});

// Agregar item al carrito
app.post("/api/carrito/agregar", (req, res) => {
  const { id, nombre, precio, imagen, categoria } = req.body;
  
  if (!id || !nombre || !precio) {
    return res.status(400).json({ error: "Datos incompletos del producto" });
  }

  // Verificar si el producto ya existe en el carrito
  const itemExistente = carritoItems.find(item => item.id === id);
  
  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carritoItems.push({
      id,
      nombre,
      precio: parseFloat(precio),
      imagen: imagen || 'https://via.placeholder.com/150',
      categoria: categoria || 'General',
      cantidad: 1
    });
  }
  
  res.json({ message: "Producto agregado al carrito", carrito: carritoItems });
});

// Actualizar cantidad de un item
app.put("/api/carrito/actualizar/:id", (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;
  
  const item = carritoItems.find(item => item.id === id);
  if (item) {
    item.cantidad = parseInt(cantidad);
    if (item.cantidad <= 0) {
      carritoItems = carritoItems.filter(item => item.id !== id);
    }
    res.json({ message: "Carrito actualizado", carrito: carritoItems });
  } else {
    res.status(404).json({ error: "Producto no encontrado en el carrito" });
  }
});

// Eliminar item del carrito
app.delete("/api/carrito/eliminar/:id", (req, res) => {
  const { id } = req.params;
  carritoItems = carritoItems.filter(item => item.id !== id);
  res.json({ message: "Producto eliminado del carrito", carrito: carritoItems });
});

// Limpiar carrito
app.delete("/api/carrito/limpiar", (req, res) => {
  carritoItems = [];
  res.json({ message: "Carrito limpiado", carrito: carritoItems });
});

// Procesar pedido (checkout)
app.post("/api/checkout", (req, res) => {
  const { datosCliente, metodoPago } = req.body;
  
  if (carritoItems.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }
  
  // Simular procesamiento del pedido
  const total = carritoItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const numeroPedido = 'PED-' + Date.now();
  
  // Limpiar carrito después del pedido
  const pedidoProcesado = {
    numeroPedido,
    items: [...carritoItems],
    total,
    datosCliente,
    metodoPago,
    fecha: new Date().toISOString(),
    estado: 'Procesando'
  };
  
  carritoItems = [];
  
  res.json({ 
    message: "Pedido procesado exitosamente", 
    pedido: pedidoProcesado 
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

