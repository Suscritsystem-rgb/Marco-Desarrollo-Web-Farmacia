const sqlite3 = require("sqlite3").verbose();

// Conectar a la base de datos
const db = new sqlite3.Database("./farmacia.db", (err) => {
  if (err) {
    console.error("❌ Error al abrir la base de datos: " + err.message);
    process.exit(1); // Salir si no puede conectar
  } else {
    console.log("✅ Conectado a la base de datos SQLite.");
    inicializarBaseDeDatos();
  }
});

// Función para manejar errores de manera consistente
function manejarError(err, mensaje) {
  if (err) {
    console.error(`❌ ${mensaje}:`, err.message);
    return true;
  }
  return false;
}

// Función principal para inicializar todas las tablas
function inicializarBaseDeDatos() {
  db.serialize(() => {
    
    // ==========================================
    // 1. TABLA CATEGORÍAS
    // ==========================================
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      icono TEXT,
      activo INTEGER DEFAULT 1
    )`, (err) => {
      if (!manejarError(err, "Error al crear tabla categorias")) {
        console.log("✅ Tabla 'categorias' creada o ya existe.");
        insertarCategorias();
      }
    });

    // ==========================================
    // 2. TABLA PRODUCTOS (General - para TODO)
    // ==========================================
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      marca TEXT,
      imagen TEXT,
      categoria_id INTEGER,
      activo INTEGER DEFAULT 1,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )`, (err) => {
      if (!manejarError(err, "Error al crear tabla productos")) {
        console.log("✅ Tabla 'productos' creada o ya existe.");
      }
    });

    // ==========================================
    // 3. TABLA MEDICAMENTOS (Mantener para compatibilidad)
    // ==========================================
    db.run(`CREATE TABLE IF NOT EXISTS medicamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      stock INTEGER NOT NULL,
      costo REAL DEFAULT 0,
      marca TEXT DEFAULT 'Genérico'
    )`, (err) => {
      if (!manejarError(err, "Error al crear tabla medicamentos")) {
        console.log("✅ Tabla 'medicamentos' creada o ya existe.");
        insertarMedicamentos();
      }
    });

    // ==========================================
    // 4. TABLA CARRITO (Persistente)
    // ==========================================
    db.run(`CREATE TABLE IF NOT EXISTS carrito_db (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      cantidad INTEGER DEFAULT 1,
      fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )`, (err) => {
      if (!manejarError(err, "Error al crear tabla carrito_db")) {
        console.log("✅ Tabla 'carrito_db' creada o ya existe.");
      }
    });

    // ==========================================
    // 5. TABLA PEDIDOS
    // ==========================================
    db.run(`CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pedido TEXT UNIQUE NOT NULL,
      total REAL NOT NULL,
      estado TEXT DEFAULT 'Pendiente',
      datos_cliente TEXT,
      metodo_pago TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (!manejarError(err, "Error al crear tabla pedidos")) {
        console.log("✅ Tabla 'pedidos' creada o ya existe.");
      }
    });

    // ==========================================
    // 6. TABLA PEDIDO_ITEMS (Detalle de pedidos)
    // ==========================================
    db.run(`CREATE TABLE IF NOT EXISTS pedido_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER,
      producto_id INTEGER,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )`, (err) => {
      if (!manejarError(err, "Error al crear tabla pedido_items")) {
        console.log("✅ Tabla 'pedido_items' creada o ya existe.");
      }
    });

  });
}

// ==========================================
// INSERTAR DATOS INICIALES
// ==========================================

function insertarCategorias() {
  db.get("SELECT COUNT(*) as count FROM categorias", (err, row) => {
    if (manejarError(err, "Error al verificar categorías")) return;
    
    if (row && row.count === 0) {
      const categorias = [
        ['Medicamentos', 'Medicamentos con y sin receta médica', 'fa-pills'],
        ['Vitaminas', 'Suplementos vitamínicos y nutricionales', 'fa-leaf'],
        ['Cuidado Personal', 'Productos de higiene y cuidado personal', 'fa-hand-sparkles'],
        ['Cuidado de Piel', 'Productos dermatológicos y cosméticos', 'fa-spa']
      ];

      const stmt = db.prepare("INSERT INTO categorias (nombre, descripcion, icono) VALUES (?, ?, ?)");
      
      categorias.forEach(([nombre, desc, icono]) => {
        stmt.run(nombre, desc, icono, (err) => {
          manejarError(err, `Error al insertar categoría ${nombre}`);
        });
      });
      
      stmt.finalize((err) => {
        if (!manejarError(err, "Error al finalizar inserción de categorías")) {
          console.log("✅ Categorías insertadas correctamente.");
          insertarProductos();
        }
      });
    }
  });
}

function insertarMedicamentos() {
  db.get("SELECT COUNT(*) AS count FROM medicamentos", (err, row) => {
    if (manejarError(err, "Error al verificar medicamentos")) return;

    if (row && row.count === 0) {
      const medicamentos = [
        ['Amoxicilina', 100, 15.50, 'Genfar'],
        ['Paracetamol', 250, 5.00, 'MK'],
        ['Ibuprofeno', 180, 8.75, 'Genfar'],
        ['Aspirina', 0, 6.50, 'Bayer'],
        ['Omeprazol', 120, 12.00, 'MK']
      ];

      const stmt = db.prepare("INSERT INTO medicamentos (nombre, stock, costo, marca) VALUES (?, ?, ?, ?)");
      
      medicamentos.forEach(([nombre, stock, costo, marca]) => {
        stmt.run(nombre, stock, costo, marca, (err) => {
          manejarError(err, `Error al insertar medicamento ${nombre}`);
        });
      });
      
      stmt.finalize((err) => {
        if (!manejarError(err, "Error al finalizar inserción de medicamentos")) {
          console.log("✅ Medicamentos de ejemplo insertados.");
        }
      });
    }
  });
}

function insertarProductos() {
  db.get("SELECT COUNT(*) as count FROM productos", (err, row) => {
    if (manejarError(err, "Error al verificar productos")) return;
    
    if (row && row.count === 0) {
      // Obtener IDs de categorías primero
      db.all("SELECT id, nombre FROM categorias", (err, categorias) => {
        if (manejarError(err, "Error al obtener categorías")) return;

        const catMap = {};
        categorias.forEach(cat => {
          catMap[cat.nombre] = cat.id;
        });

        const productos = [
          // Medicamentos
          ['Paracetamol 500mg', 'Analgésico y antipirético', 8.50, 200, 'MK', 'https://via.placeholder.com/200', catMap['Medicamentos']],
          ['Ibuprofeno 400mg', 'Antiinflamatorio', 12.00, 150, 'Genfar', 'https://via.placeholder.com/200', catMap['Medicamentos']],
          ['Amoxicilina 500mg', 'Antibiótico', 25.00, 80, 'Genfar', 'https://via.placeholder.com/200', catMap['Medicamentos']],
          
          // Vitaminas
          ['Vitamina C 1000mg', 'Fortalece el sistema inmune', 18.75, 120, 'Nature Made', 'https://via.placeholder.com/200', catMap['Vitaminas']],
          ['Omega-3', 'Suplemento cardiovascular', 32.00, 90, 'Nordic Naturals', 'https://via.placeholder.com/200', catMap['Vitaminas']],
          ['Multivitamínico', 'Complemento nutricional diario', 28.50, 100, 'Centrum', 'https://via.placeholder.com/200', catMap['Vitaminas']],
          
          // Cuidado Personal
          ['Jabón Líquido Antibacterial', 'Limpieza profunda', 15.00, 180, 'Protex', 'https://via.placeholder.com/200', catMap['Cuidado Personal']],
          ['Desodorante Roll-on', 'Protección 48h', 12.50, 200, 'Rexona', 'https://via.placeholder.com/200', catMap['Cuidado Personal']],
          
          // Cuidado de Piel
          ['Protector Solar SPF 50+', 'Protección UV', 35.00, 70, 'La Roche-Posay', 'https://via.placeholder.com/200', catMap['Cuidado de Piel']],
          ['Crema Hidratante', 'Hidratación 24h', 28.00, 95, 'Nivea', 'https://via.placeholder.com/200', catMap['Cuidado de Piel']]
        ];

        const stmt = db.prepare(`
          INSERT INTO productos (nombre, descripcion, precio, stock, marca, imagen, categoria_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        productos.forEach(([nombre, desc, precio, stock, marca, imagen, catId]) => {
          stmt.run(nombre, desc, precio, stock, marca, imagen, catId, (err) => {
            manejarError(err, `Error al insertar producto ${nombre}`);
          });
        });
        
        stmt.finalize((err) => {
          if (!manejarError(err, "Error al finalizar inserción de productos")) {
            console.log("✅ Productos de ejemplo insertados.");
          }
        });
      });
    }
  });
}

// Manejo de cierre limpio
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error al cerrar la base de datos:', err.message);
    } else {
      console.log('✅ Base de datos cerrada correctamente.');
    }
    process.exit(0);
  });
});

module.exports = db;