/* ==========================================================
   ReportaBarrio - Servidor Express
   Proyecto de aula · Tecnologías Web · ODS 11
   Los datos viven en un arreglo en memoria (sin base de datos).
   ========================================================== */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- 1. Datos de referencia ---------- */

// clave (value del select) -> nombre visible
const CATEGORIAS = {
  'vias': 'Vías y huecos',
  'alumbrado': 'Alumbrado público',
  'residuos': 'Residuos y basuras',
  'agua': 'Agua y alcantarillado',
  'espacio-publico': 'Espacio público y zonas verdes',
  'seguridad-vial': 'Seguridad vial'
};
const BARRIOS = ['San Salvador', 'Centro', 'Norte', 'Sur', 'Oriente', 'Occidente'];
const URGENCIAS = ['baja', 'media', 'alta'];
const ESTADOS = ['Pendiente', 'En proceso', 'Resuelto'];

/* ---------- 2. "Base de datos" en memoria ---------- */

// Cada reporte: id, titulo, categoria, barrio, descripcion, urgencia, contacto, fecha, estado
const reportes = [
  {
    id: 1, titulo: 'Hueco profundo en la calle principal', categoria: 'vias', barrio: 'San Salvador',
    descripcion: 'Un hueco de más de un metro de ancho cerca de la esquina obliga a los carros a invadir el otro carril.',
    urgencia: 'alta', contacto: 'vecino1@correo.com', fecha: '2026-11-02T10:00:00.000Z', estado: 'En proceso'
  },
  {
    id: 2, titulo: 'Tres postes sin luz en el parque', categoria: 'alumbrado', barrio: 'San Salvador',
    descripcion: 'Desde hace dos semanas el parque queda totalmente oscuro en la noche y los vecinos evitan pasar.',
    urgencia: 'media', contacto: 'vecino2@correo.com', fecha: '2026-11-05T14:30:00.000Z', estado: 'Pendiente'
  },
  {
    id: 3, titulo: 'Basura acumulada en la esquina', categoria: 'residuos', barrio: 'Centro',
    descripcion: 'El camión recolector no pasa y las bolsas se acumulan junto al andén, generando malos olores.',
    urgencia: 'media', contacto: '3001234567', fecha: '2026-11-08T08:15:00.000Z', estado: 'Pendiente'
  },
  {
    id: 4, titulo: 'Alcantarilla tapada con aguas estancadas', categoria: 'agua', barrio: 'San Salvador',
    descripcion: 'Cuando llueve la alcantarilla desborda y el agua inunda la calle durante horas.',
    urgencia: 'alta', contacto: 'vecino4@correo.com', fecha: '2026-11-10T16:45:00.000Z', estado: 'Pendiente'
  },
  {
    id: 5, titulo: 'Cebra peatonal borrada frente al colegio', categoria: 'seguridad-vial', barrio: 'Oriente',
    descripcion: 'La señalización se desgastó por completo y los niños cruzan sin referencia para los conductores.',
    urgencia: 'alta', contacto: 'vecino5@correo.com', fecha: '2026-11-12T07:20:00.000Z', estado: 'Resuelto'
  }
];
let siguienteId = reportes.length + 1;

/* ---------- 3. Middlewares ---------- */

// Lee el cuerpo de los formularios (POST, application/x-www-form-urlencoded) en req.body
app.use(express.urlencoded({ extended: true }));

// Sirve la carpeta public/ (HTML, CSS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- 4. Funciones auxiliares ---------- */

// Evita que el texto del usuario se interprete como HTML (seguridad básica)
function esc(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function capitalizar(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Plantilla común: devuelve una página HTML completa (misma estructura que las páginas estáticas)
function pagina(titulo, contenido, activo) {
  const enlace = (href, texto, clave) =>
    `<a href="${href}"${activo === clave ? ' aria-current="page"' : ''}>${texto}</a>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titulo)} · ReportaBarrio</title>
  <link rel="stylesheet" href="/estilos.css">
</head>
<body>
  <header id="encabezado">
    <a class="logo" href="/">
      <img src="/img/logo.svg" alt="" width="40" height="40">
      <span>ReportaBarrio</span>
    </a>
    <nav aria-label="Menú principal">
      ${enlace('/', 'Inicio', 'inicio')}
      ${enlace('/reportar.html', 'Reportar', 'reportar')}
      ${enlace('/reportes', 'Reportes', 'reportes')}
      ${enlace('/estadisticas', 'Estadísticas', 'estadisticas')}
    </nav>
  </header>
  <main>
${contenido}
  </main>
  <footer>
    <p>ReportaBarrio · Proyecto de aula de Tecnologías Web · ODS 11: Ciudades y comunidades sostenibles</p>
  </footer>
</body>
</html>`;
}

function opcionesCategoria(seleccionada) {
  const todas = `<option value="">Todas las categorías</option>`;
  return todas + Object.entries(CATEGORIAS)
    .map(([clave, nombre]) => `<option value="${clave}"${seleccionada === clave ? ' selected' : ''}>${nombre}</option>`)
    .join('');
}

function opcionesBarrio(seleccionado) {
  const todos = `<option value="">Todos los barrios</option>`;
  return todos + BARRIOS
    .map(b => `<option value="${b}"${seleccionado.toLowerCase() === b.toLowerCase() ? ' selected' : ''}>${b}</option>`)
    .join('');
}

function tarjeta(r) {
  return `
        <article class="tarjeta">
          <div class="tarjeta-etiquetas">
            <span class="etiqueta urgencia-${r.urgencia}">Urgencia ${r.urgencia}</span>
            <span class="etiqueta estado-${r.estado.toLowerCase().replace(' ', '-')}">${esc(r.estado)}</span>
          </div>
          <h3>${esc(r.titulo)}</h3>
          <p class="tarjeta-meta">${esc(CATEGORIAS[r.categoria])} · Barrio ${esc(r.barrio)}</p>
          <p>${esc(r.descripcion)}</p>
          <p class="tarjeta-pie">Reporte #${r.id} · ${formatearFecha(r.fecha)} · Contacto: ${esc(r.contacto)}</p>
        </article>`;
}

/* ---------- 5. Rutas ---------- */

// GET /reportes  -> listado con filtros opcionales por req.query (categoria y/o barrio)
app.get('/reportes', (req, res) => {
  const categoria = String(req.query.categoria || '').trim().toLowerCase();
  const barrio = String(req.query.barrio || '').trim();

  const filtrados = reportes.filter(r =>
    (categoria === '' || r.categoria === categoria) &&
    (barrio === '' || r.barrio.toLowerCase() === barrio.toLowerCase())
  );

  // Descripción de los filtros activos para mostrarla al usuario
  const activos = [];
  if (categoria) activos.push(`categoría «${esc(CATEGORIAS[categoria] || categoria)}»`);
  if (barrio) activos.push(`barrio «${esc(barrio)}»`);

  const listado = filtrados.length > 0
    ? `<div class="cuadricula">${filtrados.map(tarjeta).join('')}
      </div>`
    : `<p class="mensaje-vacio">No hay reportes${activos.length ? ' con ' + activos.join(' y ') : ' todavía'}.
         <a href="/reportes">Quitar filtros</a> o <a href="/reportar.html">crear un reporte</a>.</p>`;

  const contenido = `
    <section class="seccion">
      <h1>Reportes del barrio</h1>
      <p class="lead">${filtrados.length} reporte(s) encontrado(s)${activos.length ? ' · Filtrando por ' + activos.join(' y ') : ''}.</p>
      <div class="distribucion">
        <aside class="filtros" aria-label="Filtros">
          <h2>Filtrar</h2>
          <form action="/reportes" method="GET">
            <label for="f-categoria">Categoría</label>
            <select id="f-categoria" name="categoria">${opcionesCategoria(categoria)}</select>
            <label for="f-barrio">Barrio</label>
            <select id="f-barrio" name="barrio">${opcionesBarrio(barrio)}</select>
            <button type="submit" class="boton">Aplicar filtros</button>
            <a class="boton boton-secundario" href="/reportes">Limpiar</a>
          </form>
        </aside>
        <div>
          ${listado}
        </div>
      </div>
    </section>`;

  res.send(pagina('Reportes', contenido, 'reportes'));
});

// POST /reportes -> recibe el formulario (req.body), valida y guarda
app.post('/reportes', (req, res) => {
  const { titulo, categoria, barrio, descripcion, urgencia, contacto } = req.body;
  const errores = [];

  const texto = v => (typeof v === 'string' ? v.trim() : '');

  if (!texto(titulo)) errores.push('El título es obligatorio.');
  if (!texto(categoria)) errores.push('Debes elegir una categoría.');
  else if (!CATEGORIAS[texto(categoria)]) errores.push('La categoría elegida no es válida.');
  if (!texto(barrio)) errores.push('Debes elegir un barrio.');
  else if (!BARRIOS.includes(texto(barrio))) errores.push('El barrio elegido no es válido.');
  if (!texto(descripcion)) errores.push('La descripción es obligatoria.');
  else if (texto(descripcion).length < 10) errores.push('La descripción debe tener al menos 10 caracteres.');
  if (!texto(urgencia)) errores.push('Debes seleccionar el nivel de urgencia.');
  else if (!URGENCIAS.includes(texto(urgencia))) errores.push('El nivel de urgencia no es válido.');
  if (!texto(contacto)) errores.push('El contacto (correo o teléfono) es obligatorio.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(contacto)) && !/^[0-9+\s-]{7,15}$/.test(texto(contacto))) {
    errores.push('El contacto debe ser un correo válido o un teléfono (7 a 15 dígitos).');
  }

  // Si hay errores: código 400, mensaje claro y NO se guarda nada
  if (errores.length > 0) {
    const contenido = `
    <section class="seccion seccion-estrecha">
      <h1>No pudimos guardar tu reporte</h1>
      <p class="lead">Corrige lo siguiente y vuelve a enviarlo:</p>
      <ul class="lista-errores">
        ${errores.map(e => `<li>${esc(e)}</li>`).join('\n        ')}
      </ul>
      <a class="boton" href="/reportar.html">Volver al formulario</a>
    </section>`;
    return res.status(400).send(pagina('Error en el reporte', contenido, 'reportar'));
  }

  // Reporte válido: se agrega al arreglo con estado inicial "Pendiente"
  reportes.push({
    id: siguienteId++,
    titulo: texto(titulo),
    categoria: texto(categoria),
    barrio: texto(barrio),
    descripcion: texto(descripcion),
    urgencia: texto(urgencia),
    contacto: texto(contacto),
    fecha: new Date().toISOString(),
    estado: 'Pendiente'
  });

  res.redirect('/reportes');
});

// GET /estadisticas -> conteo por categoría y por estado
app.get('/estadisticas', (req, res) => {
  const total = reportes.length;

  const porCategoria = Object.entries(CATEGORIAS).map(([clave, nombre]) => ({
    nombre,
    cantidad: reportes.filter(r => r.categoria === clave).length
  }));
  const porEstado = ESTADOS.map(estado => ({
    nombre: estado,
    cantidad: reportes.filter(r => r.estado === estado).length
  }));

  const filas = lista => lista.map(item => {
    const pct = total ? Math.round((item.cantidad / total) * 100) : 0;
    return `
          <tr>
            <th scope="row">${esc(item.nombre)}</th>
            <td class="barra-celda"><div class="barra" style="width: ${pct}%"></div></td>
            <td class="cifra">${item.cantidad}</td>
          </tr>`;
  }).join('');

  const contenido = `
    <section class="seccion">
      <h1>Estadísticas</h1>
      <p class="lead">Total de reportes registrados: <strong>${total}</strong></p>
      <div class="cuadricula cuadricula-2">
        <article class="tarjeta">
          <h2>Reportes por categoría</h2>
          <table class="tabla-stats">
            <thead><tr><th scope="col">Categoría</th><th scope="col">Proporción</th><th scope="col">Total</th></tr></thead>
            <tbody>${filas(porCategoria)}
            </tbody>
          </table>
        </article>
        <article class="tarjeta">
          <h2>Reportes por estado</h2>
          <table class="tabla-stats">
            <thead><tr><th scope="col">Estado</th><th scope="col">Proporción</th><th scope="col">Total</th></tr></thead>
            <tbody>${filas(porEstado)}
            </tbody>
          </table>
        </article>
      </div>
    </section>`;

  res.send(pagina('Estadísticas', contenido, 'estadisticas'));
});

// 404: cualquier ruta que no coincidió con las anteriores
app.use((req, res) => {
  const contenido = `
    <section class="seccion seccion-estrecha">
      <h1>Error 404: página no encontrada</h1>
      <p class="lead">La ruta <code>${esc(req.path)}</code> no existe en ReportaBarrio.</p>
      <a class="boton" href="/">Volver al inicio</a>
    </section>`;
  res.status(404).send(pagina('Página no encontrada', contenido, ''));
});

/* ---------- 6. Arranque ---------- */
app.listen(PORT, () => {
  console.log(`ReportaBarrio funcionando en http://localhost:${PORT}`);
});
