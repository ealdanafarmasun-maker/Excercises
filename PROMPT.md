# Prompt de reconstrucción

Pega esto en Claude, ChatGPT, Cursor o Gemini para reconstruir la app desde
cero o para retomar el proyecto en otra conversación.

---

Construye una aplicación web de una sola página, **en un único archivo
`index.html`** sin build ni backend, para consultar ejercicios de gimnasio y
montar rutinas. Interfaz **en español**. HTML, CSS y JavaScript en el mismo
archivo, sin frameworks ni dependencias. Diseño mobile-first, pensado para
usarse con una mano en el gimnasio.

## Datos

Origen: `https://github.com/hasaneyldrm/exercises-dataset` (MIT), 1.324
ejercicios. El JSON está en
`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json`
(17 MB) y los medios en
`https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/`.

Cada registro:

```
id "0001" · name · category · body_part · equipment · target · muscle_group
secondary_muscles string[] · media_id · image · gif_url · attribution · created_at
instructions       { en, es, it, tr, ru, zh, hi, pl, ko, fr }
instruction_steps  mismas claves → array ordenado de pasos
```

`body_part` tiene 10 valores, `target` 19, `equipment` 28.

Al cargar el dataset, **descarta todos los idiomas menos `es`**: reduce de
11,2 MB a 1,9 MB.

Incrusta en el HTML unos 12 ejercicios de muestra, solo con instrucciones en
español, para que la app arranque con contenido sin descargar nada.

Orden de carga al abrir: 1) `data/exercises.json` o `exercises.json` relativos;
2) la copia en IndexedDB; 3) los de muestra.

## Estructura: tres pestañas

Navegación inferior fija en móvil, pestañas arriba en escritorio.

### 1. Explorar

- Buscador con retardo (~130 ms) sobre nombre, `target`, `equipment`,
  `muscle_group` y `secondary_muscles`.
- **Dos niveles de filtro encadenados**, ambos como chips horizontales con
  recuento y barra proporcional:
  - Parte del cuerpo (`body_part`), multiselección.
  - Músculo (`target`), acotado a las partes elegidas. **Oculta la fila cuando
    la selección tiene un solo músculo distinto**, porque filtrar no cambiaría
    nada. Sin parte elegida, muestra los 19. Si cambias de parte y el músculo
    marcado ya no aplica, se suelta solo.
  - Filtra **solo por músculo principal**, nunca por secundarios.
- Panel plegable con equipamiento (multiselección), orden y favoritos. Botón
  de filtros con contador de filtros activos.
- Tarjetas con ID en un raíl vertical, nombre, etiquetas, miniatura y dos
  botones: **+** (añadir a la rutina activa) y **★** (favorito).
- Ficha en hoja inferior deslizante (móvil) o modal (escritorio): GIF,
  instrucciones numeradas, datos y metadatos de multimedia con la atribución.
- Barra fija que indica a qué rutina y día se está añadiendo, con selectores.

### 2. Rutinas

Modelo:

```json
{ "id","name","created","updated",
  "days":[ { "id","name","rest",
             "items":[ { "uid","ex","sets","reps","rest","done" } ] } ] }
```

- Lista de rutinas con crear, abrir, duplicar, exportar, borrar. Cada tarjeta
  muestra días, ejercicios y series hechas sobre el total.
- Editor con pestañas de día (añadir, borrar, renombrar la rutina).
- **Arrastre con eventos de puntero** (`pointerdown/move/up`), no con el
  drag-and-drop nativo de HTML, que no responde al dedo: tirador `≡` para
  reordenar dentro del día, y soltar sobre otra pestaña de día para mover el
  ejercicio allí, resaltando la pestaña de destino. Autoscroll cerca de los
  bordes.
- Series, repeticiones y descanso editables por ejercicio.
- **Descanso del día**: presets 45 · 60 · 90 · 120 · 180 que se aplican a todos
  los ejercicios del día de un toque y quedan como valor por defecto de los que
  se añadan después. Solo se marca un preset si **todos** comparten ese valor;
  con valores mezclados no se marca ninguno.
- **Contador de series**: botón ancho por ejercicio con un punto por serie y
  texto "Serie N de M". Cada toque cierra una serie y arranca el descanso. En
  la última serie **no** arranca cuenta atrás, marca el ejercicio como completo
  y volver a tocarlo lo reinicia a cero. Si se baja el número de series por
  debajo de las hechas, se recorta.
- **Cronómetro de descanso** en barra fija inferior: tiempo grande, barra de
  progreso, +15 s, +30 s, pausa y parar. Al llegar a cero: triple pitido con
  Web Audio, `navigator.vibrate`, fondo verde y "¡Listo!", y se cierra sola a
  los 8 s. Pide `wakeLock` mientras corre.
  **Cuenta contra un instante final absoluto** (`end = Date.now() + ms`), nunca
  sumando ticks, para que siga siendo correcto tras bloquear la pantalla o
  cambiar de app. Guarda el estado y lo reanuda al reabrir.
- Progreso: barra del día y resumen `hechas/totales` más reparto de series por
  parte del cuerpo. Botón **Reiniciar** que pone el día a cero.
- Tocar el nombre o la miniatura de un ejercicio abre su ficha. Cuando se abre
  desde la rutina, el botón inferior dice **Volver a la rutina** y solo cierra
  (si dijera "Añadir", pulsarlo para salir duplicaría el ejercicio). En móvil,
  arrastrar la ficha hacia abajo más de 90 px la cierra.
- Exportar e importar rutinas en JSON, con envoltorio
  `{ "format": "idx-routine/1", "exported", "routine" }`.

### 3. Setup

Herramientas para desarrolladores, todo calculado en el navegador:

- Generador de `CREATE TABLE` + `INSERT` para PostgreSQL, MySQL, SQLite y SQL
  Server, en dos formas de esquema (una tabla, o dos con
  `exercise_translations`). Descarga del `.sql` completo por lotes.
  Cuidado con las diferencias: `CREATE INDEX IF NOT EXISTS` solo existe en
  PostgreSQL y SQLite; SQL Server necesita literales `N'…'` y limita la clave
  de índice a 900 bytes; la transacción se abre con `BEGIN`,
  `START TRANSACTION` o `BEGIN TRANSACTION` según el motor.
- Ejemplos de cliente en cURL, JavaScript, Python, PHP, Go, C# y Java que se
  regeneran al escribir la URL base.
- Prompt para generar una API REST, parametrizado por framework (Express,
  FastAPI, ASP.NET Core, Spring Boot, Laravel, Gin, NestJS) y motor.

## Multimedia

El JSON solo trae rutas relativas. Conmutador de tres modos: `Off` (solo
metadatos), `Local` (carpetas `images/` y `videos/` junto al archivo) y `CDN`
(jsDelivr). Al abrir, prueba local; si falla, comprueba el CDN. Si una imagen
no carga, se elimina sola sin romper el diseño. Mantén siempre visible el
campo `attribution`: los medios son © Gym visual y su reutilización requiere
licencia propia.

## Almacenamiento

Capa que intenta `window.storage`, cae a `localStorage` y por último a memoria,
avisando en ese caso de que no se guardará nada.

- `idx:routines`, `idx:favs`, `idx:prefs`, `idx:timer` en localStorage.
- Dataset completo en **IndexedDB** (base `idx-cache`, almacén `kv`, clave
  `dataset`): 1,9 MB no caben en localStorage, cuyo límite ronda los 5 MB.
  Botón para vaciar esa copia.

## PWA y sin conexión

Manifest generado como blob, iconos SVG en data URI, metas de Apple para
pantalla completa. `sw.js` opcional junto a `index.html`: red primero para la
app (para que las actualizaciones lleguen) con caché de respaldo, y caché
primero para los medios de jsDelivr. Registro dentro de un `try/catch` para que
la app funcione igual si el archivo no existe. Solo se activa en HTTPS o
localhost.

## Diseño

Paleta fría de zinc y grafito con acento índigo `#4B31E8`, ámbar para
equipamiento y verde azulado para músculo objetivo, con modo oscuro por
`prefers-color-scheme`. Tipografías Bricolage Grotesque para titulares,
Instrument Sans para texto y JetBrains Mono para identificadores y cifras.

Requisitos no negociables: cero desbordes horizontales a 360, 390 y 430 px;
zonas táctiles de al menos 36 px; foco visible; `prefers-reduced-motion`
respetado; nada de `localStorage` para el dataset; sin dependencias externas
salvo las tipografías.

## Verificación esperada

Antes de dar nada por bueno, comprueba de verdad: que el SQL generado se
ejecuta en SQLite; que el arrastre funciona tanto con ratón como con
`PointerEvent` de tipo `touch`; que las rutinas sobreviven a una recarga; que
el cronómetro sigue siendo correcto tras recargar a media cuenta; y que no hay
desbordes ni errores de JavaScript en las tres anchuras.
