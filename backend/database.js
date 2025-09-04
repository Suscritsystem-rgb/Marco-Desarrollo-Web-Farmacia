const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./farmacia.db", (err) => {
  if (err) {
    console.error("Error al abrir la base de datos: " + err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
    db.run(
      `CREATE TABLE IF NOT EXISTS medicamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        stock INTEGER NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("Error al crear la tabla: " + err.message);
        } else {
          console.log("Tabla 'medicamentos' creada o ya existe.");
          // Opcional: Insertar algunos datos de ejemplo si la tabla está vacía
          db.get("SELECT COUNT(*) AS count FROM medicamentos", (err, row) => {
            if (row.count === 0) {
              db.run("INSERT INTO medicamentos (nombre, stock) VALUES (?, ?)", ["Amoxicilina", 100]);
              db.run("INSERT INTO medicamentos (nombre, stock) VALUES (?, ?)", ["Paracetamol", 250]);
              db.run("INSERT INTO medicamentos (nombre, stock) VALUES (?, ?)", ["Ibuprofeno", 0]);
              console.log("Datos de ejemplo insertados.");
            }
          });
        }
      }
    );
  }
});

module.exports = db;

