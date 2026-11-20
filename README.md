# ReportaBarrio

Plataforma ciudadana para reportar problemas del barrio.
Proyecto de aula · **Tecnologías Web** · Ingeniería de Sistemas · Universidad Simón Bolívar

## Integrantes

- Cristian Lauren
- Luis Ferrer

## Descripción

ReportaBarrio permite a los vecinos **registrar** problemas cotidianos (huecos, basuras, alumbrado, fugas de agua, falta de señalización), **consultarlos y filtrarlos** por categoría y barrio, y **ver estadísticas** por categoría y por estado.
Tema de esta versión: *barrios resilientes frente a las lluvias* (agua y alcantarillado, residuos que tapan desagües, vías inundables).

No usa base de datos: los reportes viven en un arreglo en memoria (se reinician al apagar el servidor; arranca con 5 reportes de ejemplo). No usa React ni frameworks CSS.

## ODS elegido

**ODS 11: Ciudades y comunidades sostenibles**

| Meta | Cómo contribuye la aplicación |
|------|-------------------------------|
| 11.1 Acceso a servicios básicos | Reportes de agua, alcantarillado y alumbrado |
| 11.3 Urbanización inclusiva y participativa | Los vecinos registran, consultan y hacen seguimiento |
| 11.6 Reducir el impacto ambiental urbano | Reportes de residuos y espacio público / zonas verdes |

## Instalación y ejecución

Requisitos: Node.js 18 o superior.

```bash
npm install
npm run dev     # desarrollo (nodemon reinicia al guardar cambios)
# o bien
npm start       # ejecución normal
```

Al iniciar, la consola muestra: `ReportaBarrio funcionando en http://localhost:3000`

## Rutas del servidor

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Página de inicio (estática, `public/index.html`) |
| GET | `/reportar.html` | Formulario de reporte (estático) |
| GET | `/reportes` | Listado en tarjetas. Filtros opcionales por `req.query`: `categoria` y `barrio` (combinables) |
| POST | `/reportes` | Recibe el formulario (`req.body`), valida, guarda y redirige a `/reportes`. Si falta algo responde **400** con un mensaje y no guarda |
| GET | `/estadisticas` | Conteo de reportes por categoría y por estado |
| GET | cualquier otra | Página **404** |
| GET | `/estilos.css`, `/img/*` | Archivos estáticos (`express.static`) |

Valores de `categoria`: `vias`, `alumbrado`, `residuos`, `agua`, `espacio-publico`, `seguridad-vial`.
Valores de `barrio`: San Salvador (barrio principal del proyecto), Centro, Norte, Sur, Oriente, Occidente.

Ejemplos: `/reportes?categoria=alumbrado` · `/reportes?categoria=residuos&barrio=Centro`

## Estructura del proyecto

```
reportabarrio/
├── package.json
├── index.js              (servidor Express: rutas, validación y lógica)
├── README.md
├── public/
│   ├── index.html
│   ├── reportar.html
│   ├── estilos.css
│   └── img/logo.svg
```

Las vistas **Reportes** y **Estadísticas** las genera el servidor con template strings, por eso no son archivos estáticos.

## Pruebas de aceptación

| N.º | Prueba | Cómo verificarla |
|-----|--------|------------------|
| 1 | Inicia sin errores | `npm install` y `npm run dev` muestran la URL local |
| 2 | Estáticos | `http://localhost:3000/` carga con CSS |
| 3 | Responsive | Reducir la ventana a ~400 px: una columna y menú vertical |
| 4 | POST válido | Enviar el formulario completo: redirige a `/reportes` y aparece el reporte |
| 5 | POST inválido | Quitar `required` desde las herramientas del navegador, enviar con un campo vacío: 400 y mensaje |
| 6 | Filtro simple | `/reportes?categoria=alumbrado` |
| 7 | Filtro combinado | `/reportes?categoria=residuos&barrio=Centro`; con un barrio sin reportes aparece un mensaje |
| 8 | Estadísticas y 404 | `/estadisticas` y `/xyz` |
