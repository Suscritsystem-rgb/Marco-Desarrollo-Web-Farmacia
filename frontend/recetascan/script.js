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

