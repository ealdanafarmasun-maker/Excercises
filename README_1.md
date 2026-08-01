# Índice · ejercicios y rutinas

App web de una sola página para consultar 1.324 ejercicios de gimnasio y montar
rutinas por día, con contador de series y cronómetro de descanso.

Sin backend, sin cuenta, sin build. Un archivo HTML que se abre en el navegador
o se publica en cualquier hosting estático.

- **Datos**: [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
- **Interfaz**: español
- **Peso**: 109 KB el HTML, más 1,9 MB de datos cuando descargas el dataset completo

---

## Puesta en marcha

### Publicado (recomendado para el móvil)

1. Sube `index.html` y `sw.js` a la raíz de un repositorio público de GitHub.
2. *Settings* → *Pages* → *Build and deployment* → Source: **Deploy from a
   branch** → Branch: `main` + `/ (root)` → **Save**.
3. Espera unos minutos. La URL sigue el patrón
   `https://USUARIO.github.io/REPO/`.
4. En el móvil: Safari → Compartir → *Añadir a pantalla de inicio*.
   Chrome Android → ⋮ → *Añadir a pantalla de inicio*.

El archivo **debe llamarse `index.html`**, en minúsculas: GitHub Pages
distingue mayúsculas y solo sirve ese nombre en la raíz del sitio.

Publicar es preferible a abrir el archivo suelto porque el almacenamiento del
navegador va ligado al origen, y HTTPS es requisito para el modo pantalla
completa y para el service worker.

### Local

Doble clic en `index.html`. Funciona, pero sin service worker (`file://` no lo
permite). Para tener también los GIF sin conexión, coloca el archivo dentro de
una copia del repositorio de datos:

```
git clone --depth 1 https://github.com/hasaneyldrm/exercises-dataset.git
cp index.html exercises-dataset/
```

---

## Archivos

| Archivo | Necesario | Qué es |
| --- | --- | --- |
| `index.html` | sí | La app entera: HTML, CSS y JS en un solo archivo |
| `sw.js` | opcional | Service worker: guarda la app y los GIF vistos para uso sin conexión |
| `images/`, `videos/` | opcional | Miniaturas y GIF locales. Si no están, se usan por CDN |

En un sitio publicado conviene **no** subir `images/` ni `videos/` parciales:
la app detectaría las carpetas, se pondría en modo Local y solo mostraría los
medios presentes.

---

## Las tres pestañas

### Explorar

Buscador sobre nombre, músculo, equipamiento y músculos secundarios, con
retardo de 130 ms.

Filtros en dos niveles encadenados:

- **Parte del cuerpo** — 10 valores, multiselección, con recuento y barra
  proporcional.
- **Músculo** — el campo `target`, 19 valores. Acotado a las partes elegidas.
  La fila se oculta cuando la selección tiene un solo músculo, porque filtrar
  no cambiaría nada. Sin parte elegida se muestran los 19, para ir directo.

Solo filtra por músculo **principal**. Un ejercicio como el press de banca
tiene `target: pectorals` y `triceps` como secundario: buscando *triceps*
aparecen los 141 que existen para entrenar tríceps, no los 268 donde ayuda.

Dentro del panel plegable: equipamiento (28 valores, multiselección), orden y
favoritos. El botón de filtros lleva un contador de filtros activos.

Cada tarjeta tiene **+** (añadir a la rutina activa) y **★** (favorito). Al
tocar el cuerpo de la tarjeta se abre la ficha: GIF, instrucciones paso a paso,
datos del ejercicio y metadatos de multimedia.

### Rutinas

Una rutina tiene días; cada día tiene ejercicios.

- Barra fija en Explorar que indica a qué rutina y día se está añadiendo.
- **Arrastre**: tira de `≡` para reordenar. Suelta sobre otra pestaña de día
  para mover el ejercicio a ese día. Funciona con dedo y con ratón.
- **Series, repeticiones y descanso** por ejercicio.
- **Descanso del día**: presets 45 · 60 · 90 · 120 · 180 que se aplican a todos
  los ejercicios del día de un toque y quedan como valor por defecto para los
  que añadas después. Solo se marca un preset si todos comparten ese valor.
- **Contador de series**: el botón ancho de cada ejercicio cierra una serie,
  enciende un punto y arranca el descanso. En la última serie no arranca
  cuenta atrás y marca el ejercicio como completo; volver a tocarlo lo reinicia.
- **Cronómetro**: barra inferior con el tiempo, +15 s, +30 s, pausa y parar.
  Al llegar a cero pita, vibra y se pone verde.
- **Progreso**: barra del día, resumen en `hechas/totales` y el mismo dato por
  rutina en la lista.
- **Reiniciar** pone a cero las series del día para la siguiente sesión.
- Tocar el nombre o la miniatura de un ejercicio abre su ficha. El botón
  inferior dice *Volver a la rutina*; en móvil también se cierra arrastrándola
  hacia abajo.
- **Exportar / Importar** rutinas como JSON.

### Setup

Herramientas para quien quiera montar un backend con estos datos:

- Generador de SQL para **PostgreSQL, MySQL, SQLite y SQL Server**, en dos
  formas de esquema: una tabla con columna de instrucciones, o dos tablas con
  `exercise_translations` por si más adelante se añaden idiomas. Descarga el
  `.sql` completo con los 1.324 INSERT, generado en el navegador.
- Ejemplos de cliente en **cURL, JavaScript, Python, PHP, Go, C# y Java**, que
  se actualizan al escribir la URL base.
- Prompt listo para pegar en un asistente de IA, parametrizado por framework
  (Express, FastAPI, ASP.NET Core, Spring Boot, Laravel, Gin, NestJS) y motor.

---

## Datos

### Origen y carga

Al arrancar la app busca, en este orden:

1. `data/exercises.json`, `exercises.json` (caso de repositorio clonado)
2. La copia guardada en IndexedDB
3. Los 12 ejercicios de demo incrustados en el propio HTML

El botón **Descargar de GitHub** trae los 1.324 desde `raw.githubusercontent.com`
(17 MB). Solo hace falta pulsarlo una vez.

### Adelgazado a español

El JSON original guarda cada instrucción en diez idiomas. Al cargarlo la app se
queda solo con `es` y descarta el resto: **1,9 MB en vez de 11,2 MB**. Eso es
lo que se guarda en IndexedDB.

### Multimedia

El JSON no incluye los archivos, solo rutas relativas (`images/0001-…jpg`,
`videos/0001-…gif`). El conmutador **GIF** de la barra superior elige de dónde
salen:

| Modo | Origen |
| --- | --- |
| `Off` | Nada, solo metadatos |
| `Local` | Carpetas `images/` y `videos/` junto al archivo |
| `CDN` | `cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/` |

Al abrir, la app prueba primero si hay carpetas locales; si no, comprueba el
CDN. Si una imagen falla, se elimina sola y la tarjeta sigue funcionando.

### Esquema de cada ejercicio

```
id                 "0001"  · identificador de 4 dígitos
name               nombre completo
category           espejo de body_part
body_part          back | cardio | chest | lower arms | lower legs |
                   neck | shoulders | upper arms | upper legs | waist
equipment          "barbell", "body weight", … (28 valores)
target             músculo principal (19 valores)
muscle_group       sinergista principal
secondary_muscles  string[]
instructions       { es: "…" }        tras el adelgazado
instruction_steps  { es: ["…", …] }   pasos ordenados
media_id           id del medio original
image / gif_url    rutas relativas
attribution        "© Gym visual — https://gymvisual.com/"
created_at         ISO 8601
```

### Modelo de rutina

```json
{
  "id": "a1b2c3d",
  "name": "Push / Pull / Legs",
  "days": [
    {
      "id": "d4e5f6g",
      "name": "Día 1",
      "rest": 90,
      "items": [
        { "uid": "h7i8j9k", "ex": "0025", "sets": 3, "reps": 10, "rest": 90, "done": 0 }
      ]
    }
  ],
  "created": 1750000000000,
  "updated": 1750000000000
}
```

El archivo exportado envuelve esto en
`{ "format": "idx-routine/1", "exported": "…", "routine": { … } }`.

---

## Almacenamiento

| Dónde | Qué | Clave |
| --- | --- | --- |
| localStorage | Rutinas | `idx:routines` |
| localStorage | Favoritos | `idx:favs` |
| localStorage | Preferencias (medios, rutina y día activos) | `idx:prefs` |
| localStorage | Cronómetro en curso | `idx:timer` |
| IndexedDB | Dataset completo | base `idx-cache`, almacén `kv`, clave `dataset` |
| Cache API | App y GIF vistos (solo con `sw.js`) | `idx-v1-app`, `idx-v1-media` |

Hay una capa que intenta `window.storage`, cae a `localStorage` y, si todo
falla, a memoria — avisando en ese caso de que no se guardará nada.

El dataset no cabe en localStorage: son 1,9 MB frente a un límite de unos
5 MB por origen, demasiado justo. De ahí IndexedDB.

**Nada se sincroniza entre dispositivos.** El almacenamiento va ligado al
origen. Para pasar rutinas entre el móvil y el ordenador, o antes de cambiar
de dominio, usa Exportar.

---

## Decisiones que conviene conocer

**El cronómetro cuenta contra un instante final absoluto**, no sumando ticks.
Los navegadores móviles congelan los temporizadores al bloquear la pantalla o
cambiar de app; un cronómetro por acumulación se quedaría corto justo cuando
estás descansando y mirando otra cosa. Verificado recargando a media cuenta:
iba por 00:58, la recarga tardó 3 s y volvió marcando 00:55.

**El arrastre usa eventos de puntero**, no el drag-and-drop nativo de HTML,
que no responde al dedo. El mismo mecanismo sirve para reordenar ejercicios,
moverlos entre días y cerrar la ficha deslizando.

**Añadir se hace con un botón, no arrastrando** desde el explorador. Arrastrar
desde una lista que hace scroll es frágil con el pulgar.

**Actualizar `index.html` no borra tus rutinas**: viven en el almacenamiento
del navegador, ligado a la URL, no dentro del archivo. Lo que sí las dejaría
atrás es cambiar de dominio.

Si cambias `index.html` y quieres forzar la actualización en móviles que ya lo
tienen instalado, sube la versión en la primera línea de `sw.js`
(`idx-v1` → `idx-v2`).

---

## Limitaciones conocidas

- La **vibración no funciona en iPhone**: Safari no la expone a las webs.
  En Android sí.
- Con la app en segundo plano o el móvil bloqueado, **el pitido probablemente
  no suene**, porque el navegador suspende el audio. Al volver verás el aviso
  correcto en pantalla. Resolverlo del todo requiere una app nativa.
- Solo español. Recuperar otros idiomas exigiría volver a descargar el dataset.
- Sin cuentas ni sincronización.

---

## Licencia

- Código de esta app, datos, estructura y traducciones: **MIT**, de
  [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset).
- **Imágenes y GIF: © [Gym visual](https://gymvisual.com/)**, redistribuidos en
  el repositorio de origen con permiso a 180×180. El campo `attribution` debe
  seguir visible. Para usarlos en un producto necesitas tu propia licencia con
  ellos; el modo CDN enlaza a la fuente en vez de republicarlos.
