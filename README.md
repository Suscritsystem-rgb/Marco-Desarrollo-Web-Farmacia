# FarmaJoven - Proyecto Web de Farmacia

## Estructura del Proyecto

```
Desarrollo-Web-Farmacia/
│
├── backend/                # API Node.js con Express y SQLite
│   ├── server.js          # Servidor principal
│   ├── database.js        # Configuración de base de datos
│   ├── package.json       # Dependencias del backend
│   └── farmacia.db        # Base de datos SQLite
│
├── frontend/              # Todo lo que es HTML, CSS y JS del cliente
│   ├── index.html         # Página principal
│   ├── medicamentos.html  # Página de medicamentos
│   ├── cuidado-personal.html # Página de cuidado personal
│   ├── cuidado-piel.html  # Página de cuidado de la piel
│   ├── vitaminas.html     # Página de vitaminas
│   │
│   ├── recetascan/        # Submódulo para RecetaScan
│   │   ├── index.html     # Página principal del escáner
│   │   ├── script.js      # Lógica del escáner
│   │   └── style.css      # Estilos específicos del escáner
│   │
│   └── assets/            # Imágenes, CSS global, JS global
│
└── README.md              # Este archivo
```

## Instrucciones de Uso

### Para el Frontend:
1. Abrir VS Code en la carpeta `frontend/`
2. Usar Live Server desde esa carpeta
3. La URL será: `http://127.0.0.1:5500/index.html`

### Para el Backend:
1. Navegar a la carpeta `backend/`
2. Ejecutar `npm install` para instalar dependencias
3. Ejecutar `node server.js` para iniciar el servidor
4. El servidor estará disponible en `http://localhost:3000`

## Funcionalidades

- **Página Principal**: Información general de la farmacia
- **Catálogo de Productos**: Medicamentos, cuidado personal, vitaminas, cuidado de la piel
- **RecetaScan**: Módulo para escanear recetas médicas
- **API Backend**: Gestión de productos y datos con SQLite

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js, SQLite
- **Estilos**: Font Awesome para iconos
