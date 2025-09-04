# RecetaScan – Guía paso a paso (VS Code)

> **Formato de trabajo**: ejecuta **un paso a la vez** y responde en el chat con **“OK Paso N”** (ej.: *OK Paso 1*) + resultado/errores. Yo te doy el siguiente paso.

---

## ✅ Preparación (solo si no está hecho)
1. **Backend**: abre una terminal en `backend/` y deja corriendo:
   ```powershell
   npm start
   ```
   Deberías ver: `Servidor backend escuchando en http://localhost:3000`.
2. **Frontend**: en VS Code ten instalada la extensión **Live Server**.

> Cuando confirmes esto, empezamos con los cambios de Frontend y el módulo **RecetaScan**.

---

## Paso 1 — Crear CSS global para estilos consistentes
**Objetivo**: unificar estilos y eliminar `<style>` internos del Home.

1. Crea el archivo `frontend/assets/global.css` con este contenido (puedes ajustar colores más tarde):
   ```css
   :root { --primary-color:#4a6fa5; --secondary-color:#6c9bcf; --accent-color:#ff85a2; --light-bg:#f8f9fa; --dark-text:#2c3e50; }
   body { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:var(--dark-text); background-color:#fff; }
   .navbar{background:linear-gradient(135deg,var(--primary-color) 0%,var(--secondary-color)100%);box-shadow:0 2px 15px rgba(0,0,0,.1);padding:15px 0}
   .navbar-brand{font-weight:700;font-size:1.8rem}.navbar-brand,.nav-link{color:#fff!important}
   .nav-link{font-weight:500;margin:0 10px;transition:all .3s}.nav-link:hover{transform:translateY(-2px)}
   .hero-section{background:linear-gradient(rgba(255,255,255,.9),rgba(255,255,255,.9)),url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1500&q=80');background-size:cover;background-position:center;padding:6rem 0;position:relative}
   .btn-farmacia{background:linear-gradient(to right,var(--primary-color),var(--secondary-color));color:#fff;border:none;border-radius:30px;padding:12px 30px;transition:all .3s;box-shadow:0 4px 15px rgba(74,111,165,.3);font-weight:600}
   .btn-farmacia:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(74,111,165,.4);color:#fff}
   .btn-outline-farmacia{border:2px solid var(--primary-color);color:var(--primary-color);border-radius:30px;padding:10px 25px;font-weight:600;transition:all .3s}
   .btn-outline-farmacia:hover{background:linear-gradient(to right,var(--primary-color),var(--secondary-color));color:#fff;transform:translateY(-3px)}
   .card{transition:all .3s ease;border:none;border-radius:15px;overflow:hidden;box-shadow:0 5px 15px rgba(0,0,0,.08);height:100%}
   .card:hover{transform:translateY(-10px);box-shadow:0 15px 30px rgba(0,0,0,.15)}
   .card-img-top{height:200px;object-fit:cover;transition:transform .5s}.card:hover .card-img-top{transform:scale(1.05)}
   .card-title{color:var(--primary-color);font-weight:600}
   .feature-icon{background:linear-gradient(135deg,var(--primary-color) 0%,var(--secondary-color) 100%);width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:#fff;font-size:30px;box-shadow:0 5px 15px rgba(74,111,165,.3)}
   .section-title{position:relative;padding-bottom:15px;margin-bottom:40px;text-align:center}
   .section-title:after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:80px;height:3px;background:linear-gradient(to right,var(--primary-color),var(--secondary-color));border-radius:3px}
   .footer{background:linear-gradient(135deg,var(--primary-color) 0%,var(--secondary-color) 100%);color:#fff;padding:3rem 0 1.5rem}
   .social-icon{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.1);display:inline-flex;align-items:center;justify-content:center;margin:0 5px;transition:all .3s}
   .social-icon:hover{background:rgba(255,255,255,.2);transform:translateY(-3px)}
   @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fadein{animation:fadeIn .8s ease forwards}
   .offer-badge{position:absolute;top:15px;right:15px;z-index:1;border-radius:20px;padding:5px 15px;font-weight:600;background:linear-gradient(to right,#ff6b6b,#ff9e7d)}
   .testimonial-card{border-left:4px solid var(--primary-color)}
   .newsletter-section{background:linear-gradient(rgba(74,111,165,.9),rgba(108,155,207,.9)),url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1350&q=80');background-size:cover;background-attachment:fixed;padding:5rem 0;color:#fff}
   @media(max-width:768px){.hero-section{padding:4rem 0}.feature-icon{width:60px;height:60px;font-size:24px}}
   ```
2. Abre `frontend/index.html` y **elimina** el bloque `<style> ... </style>` interno.
3. En el `<head>` de `frontend/index.html`, enlaza el CSS global:
   ```html
   <link rel="stylesheet" href="./assets/global.css">
   ```
4. (Opcional recomendado) Repite el enlace del **global.css** en `medicamentos.html`, `cuidado-personal.html`, `vitaminas.html`, `cuidado-piel.html` si existen.

**Validación**: abre el Home con Live Server (o refresca) y verifica que los estilos siguen viéndose igual.

---

## Paso 2 — Crear la página del módulo RecetaScan
1. Abre/crea `frontend/recetascan/index.html` y reemplaza todo su contenido por:
   ```html
   <!DOCTYPE html><html lang="es"><head>
   <meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
   <title>RecetaScan - FarmaJoven</title>
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
   <link rel="stylesheet" href="../assets/global.css">
   <link rel="stylesheet" href="./style.css">
   </head><body>
   <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
     <div class="container">
       <a class="navbar-brand" href="../index.html"><i class="fas fa-clinic-medical me-2"></i>FarmaJoven</a>
       <div class="collapse navbar-collapse"><ul class="navbar-nav ms-auto">
         <li class="nav-item"><a class="nav-link" href="../index.html">Inicio</a></li>
         <li class="nav-item"><a class="nav-link active" href="index.html"><i class="fas fa-notes-medical me-1"></i> Escanear Receta</a></li>
       </ul></div>
     </div>
   </nav>

   <main class="container py-5 recetascan-container">
     <h1 class="mb-4">📑 Escanear/Validar Receta</h1>
     <div class="mb-3">
       <label class="form-label" for="transcribed-text">Pega aquí el texto (o resultado OCR):</label>
       <textarea id="transcribed-text" class="form-control" rows="6" placeholder="Ej: Amoxicilina 500mg, Paracetamol 1g, Ibuprofeno 400mg"></textarea>
     </div>
     <div class="d-flex gap-2">
       <button id="validate" class="btn btn-primary">Validar con base de datos</button>
       <button id="normalize" class="btn btn-outline-secondary">Normalizar con IA</button>
     </div>
     <section id="results" class="mt-4" style="display:none;">
       <h3>Resultados</h3>
       <div id="medication-results" class="d-flex flex-wrap gap-2 results-section"></div>
     </section>
   </main>

   <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
   <script src="script.js"></script>
   </body></html>
   ```

**Validación**: navega a `http://127.0.0.1:5500/frontend/recetascan/index.html` y comprueba que ya **no** se ve el Home, sino la UI del módulo.

---

## Paso 3 — Crear la lógica del módulo (`recetascan/script.js`)
Crea/edita `frontend/recetascan/script.js` con:
```javascript
const transcribedTextarea = document.getElementById('transcribed-text');
const validateButton = document.getElementById('validate');
const normalizeButton = document.getElementById('normalize');
const resultsSection = document.getElementById('results');
const medicationResultsDiv = document.getElementById('medication-results');

function extractMeds(text){
  return text.split(/\n|,|\./).map(s=>s.trim()).filter(Boolean);
}

validateButton.addEventListener('click', async()=>{
  const text = transcribedTextarea.value.trim();
  if(!text){ alert('No hay texto para validar.'); return; }
  resultsSection.style.display='block';
  medicationResultsDiv.innerHTML='<p>Validando...</p>';
  try{
    const meds = extractMeds(text);
    const res = await fetch('http://localhost:3000/validar-stock',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({medicamentos: meds})
    });
    if(!res.ok) throw new Error('Error en validar-stock');
    const data = await res.json();
    medicationResultsDiv.innerHTML='';
    data.forEach(med=>{
      const el = document.createElement('div');
      el.className = `card p-2 ${med.disponible?'disponible':'no-disponible'}`;
      el.innerHTML = `<strong>${med.nombre}</strong> ${med.disponible?'✔️ Disponible':'❌ Sin stock'}`;
      medicationResultsDiv.appendChild(el);
    });
  }catch(e){ console.error(e); medicationResultsDiv.innerHTML='<p class="text-danger">Error validando el stock.</p>'; }
});

normalizeButton.addEventListener('click', async()=>{
  const text = transcribedTextarea.value.trim();
  if(!text){ alert('No hay texto para normalizar.'); return; }
  resultsSection.style.display='block';
  medicationResultsDiv.innerHTML='<p>Consultando IA...</p>';
  try{
    const res = await fetch('http://localhost:3000/normalizar-receta',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({texto: text})
    });
    if(!res.ok) throw new Error('Error en normalizar-receta');
    const normalizedText = await res.json();
    const normBox = document.createElement('div');
    normBox.className='card p-2 sugerencia';
    normBox.innerHTML = `<em>Sugerencia IA:</em> ${normalizedText}`;
    medicationResultsDiv.innerHTML='';
    medicationResultsDiv.appendChild(normBox);

    const meds = extractMeds(normalizedText);
    const res2 = await fetch('http://localhost:3000/validar-stock',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({medicamentos: meds})
    });
    if(!res2.ok) throw new Error('Error en validar-stock');
    const data2 = await res2.json();
    data2.forEach(med=>{
      const el=document.createElement('div');
      el.className=`card p-2 ${med.disponible?'disponible':'no-disponible'}`;
      el.innerHTML=`<strong>${med.nombre}</strong> ${med.disponible?'✔️ Disponible':'❌ Sin stock'}`;
      medicationResultsDiv.appendChild(el);
    });
  }catch(e){ console.error(e); medicationResultsDiv.innerHTML='<p class="text-danger">Error con la IA o la validación.</p>'; }
});
```

**Validación**: sin recargar el backend, refresca la página de RecetaScan. Pega `Amoxicilina 500mg, Paracetamol 1g, Ibuprofeno 400mg` y pulsa **Validar**. Esperado: ✔️ para Amoxicilina/Paracetamol y ❌ para Ibuprofeno.

---

## Paso 4 — Estilos del módulo (`recetascan/style.css`)
Crea/edita `frontend/recetascan/style.css`:
```css
.recetascan-container{max-width:900px;margin:2rem auto;padding:2rem;background:#fff;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,.08)}
.results-section .card{color:#fff;font-weight:500}
.results-section .card.disponible{background-color:#28a745}
.results-section .card.no-disponible{background-color:#dc3545}
.results-section .card.sugerencia{background-color:#ffc107;color:#212529}
#medication-results>div{min-width:260px}
```

**Validación**: refresca RecetaScan y comprueba que las tarjetas (disponible/no disponible/sugerencia) se ven con colores.

---

## Paso 5 — Prueba directa del backend (opcional, para diagnosticar)
Con otra terminal abierta en `backend/` **(deja `npm start` corriendo en otra pestaña)**, prueba los endpoints:

**PowerShell**
```powershell
curl -Method POST -Uri http://localhost:3000/validar-stock -ContentType 'application/json' -Body '{"medicamentos":["Amoxicilina","Ibuprofeno"]}'
```

**CMD**
```bat
curl -X POST http://localhost:3000/validar-stock -H "Content-Type: application/json" -d "{\"medicamentos\":[\"Amoxicilina\",\"Ibuprofeno\"]}"
```

**Esperado**: JSON con `disponible:true/false`.

---

## Paso 6 — (Opcional) Habilitar normalización con IA
Si quieres usar el botón **Normalizar con IA**:
1. Obtén tu API key de OpenRouter y define la variable de entorno **ANTES** de arrancar el backend.
   - **CMD**:
     ```bat
     set OPENROUTER_API_KEY=tu_api_key_aqui
     npm start
     ```
   - **PowerShell**:
     ```powershell
     $env:OPENROUTER_API_KEY="tu_api_key_aqui"; npm start
     ```
2. Vuelve a probar el botón **Normalizar con IA** en el módulo.

---

## Paso 7 — Prueba final de flujo completo
1. Live Server → `frontend/index.html` → menú **Escanear Receta**.
2. Pega: `Amoxicilina 500mg, Paracetamol 1g, Ibuprofeno 400mg`.
3. **Validar** → tarjetas con ✔️/❌.
4. (Si activaste IA) **Normalizar con IA** → aparece una **Sugerencia IA** y luego la validación de stock.

---

## Paso 8 — Commit y push
Cuando todo funcione:
```bash
git add frontend/assets/global.css frontend/recetascan/index.html frontend/recetascan/script.js frontend/recetascan/style.css frontend/index.html
git commit -m "RecetaScan: página, lógica y estilos + global.css"
git push
```

---

### ¿Siguiente?
- Integramos este frontend en una **app portable** con **Electron + Vite** (si lo necesitas para entrega). Puedo darte una checklist específica.

---

**Ahora, responde con “OK Paso 1” cuando completes el Paso 1.**

