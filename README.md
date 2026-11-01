# Radio Bezmiliana

Web de la radio escolar del **IES Bezmiliana** (Rincón de la Victoria, Málaga). Es un sitio **estático** (HTML, CSS y JavaScript, sin servidor ni base de datos) pensado para publicarse en **GitHub Pages**.

Contiene la presentación de la radio, el catálogo de programas con una página propia para cada uno, el equipo, el contacto y la información para inscribirse.

---

## Páginas

| Página | Archivo | Qué muestra |
|---|---|---|
| Inicio | `index.html` | Presentación y los 3 últimos programas |
| Programas | `programas.html` | Todos los programas, con filtro por categoría |
| Página de un programa | `programas/CODIGO/index.html` | Portada, descripción, botón del videopodcast (si lo tiene), audio y equipo |
| Equipo | `equipo.html` | Profesorado, Coordinación y Equipo |
| Contacto | `contacto.html` | Datos de contacto |
| Inscríbete | `inscribete.html` | Inscripciones y botón al formulario |
| Administración | `admin.html` | Panel para subir y editar contenido (ver más abajo) |

`programas/index.html` solo redirige a `programas.html`, para que la dirección `/programas/` no dé error.

---

## Estructura del proyecto

```
├── index.html, programas.html, equipo.html, contacto.html, inscribete.html
├── admin.html                  Panel de administración
├── programas/
│   ├── index.html              Redirige al listado de programas
│   └── CODIGO/index.html       Una carpeta por programa (se generan solas)
├── data/data.js                Todos los datos: programas, equipo y categorías
├── js/
│   ├── site.js                 Dibuja la cabecera, el pie y el contenido de cada página
│   └── admin.js                Lógica del panel de administración
├── style.css                   Estilos (los colores y la identidad están en :root)
├── assets/                     Logos e iconos
├── audios/                     Archivos mp3 de los programas
├── imagenes/                   Portadas de los programas
├── herramientas/
│   └── generar_programas.py    Regenera las páginas de programas y el sitemap
├── sitemap.xml, robots.txt, site.webmanifest
└── README.md
```

---

## Cómo funciona

Todo el contenido sale de un único archivo, **`data/data.js`**. Las páginas cargan ese archivo y `js/site.js` dibuja el contenido: tarjetas de programas, filtros, equipo, etc. Si cambias `data.js`, cambia la web entera.

Cada programa tiene su propia página en **`/programas/CODIGO/`**. Esa página es un archivo muy pequeño que solo contiene el título, la descripción y el código del programa; el resto lo dibuja `site.js` a partir de `data.js`.

### Estructura de `data/data.js`

```js
window.RB_DATA = {
  "formularioUrl": "",            // Enlace al formulario de inscripción
  "categorias": ["Noticias", "Música", "Entrevistas", "Cultura", "Ciencia", "Deportes"],
  "equipo": {
    "profesorado":  [{ "nombre": "...", "rol": "..." }],
    "coordinacion": [{ "nombre": "...", "rol": "..." }],
    "miembros":     [{ "nombre": "...", "rol": "..." }]   // Sección «Equipo»
  },
  "programas": [
    {
      "titulo": "Tech & Aula",
      "codigo": "tech-aula",                  // Dirección: /programas/tech-aula/
      "descripcion": "...",
      "categoria": "Ciencia",
      "imagen": "imagenes/tech-aula.jpg",     // Opcional
      "audio": "audios/tech-aula.mp3",
      "video": "https://youtu.be/...",        // Opcional: enlace de YouTube si es video-podcast
      "equipo": ["Nombre 1", "Nombre 2"],
      "invitados": ["Alu42", "Profe3"]       // Opcional: si falta o está vacío, no se muestra
    }
  ]
};
```

- `formularioUrl` no se puede cambiar desde el panel: edítalo a mano en `data.js`. Si está vacío, el botón de **Inscríbete** muestra un aviso en lugar de abrir el formulario.
- Un programa sin `imagen` muestra la letra inicial del título sobre un fondo de color.
- Un programa con `video` muestra el botón **Ver el videopodcast** en su página y la etiqueta «Vídeo-podcast» en su tarjeta.

---

## Panel de administración (`admin.html`)

Permite subir programas, editarlos, eliminarlos y gestionar el equipo **sin tocar el código**.

**Requisitos:** Chrome o Edge (usa la API de acceso a carpetas del navegador) y tener la web descargada en tu ordenador.

1. Abre `admin.html` desde tu copia local de la web (por ejemplo con `python3 -m http.server`, ver más abajo).
2. Pulsa **Elegir carpeta de la web** y selecciona la carpeta raíz, la que contiene `index.html`. Concede el permiso de lectura y escritura.
3. Usa los formularios. El panel escribe directamente en los archivos de tu carpeta.
4. Cuando termines, **sube los cambios a GitHub** (ver «Publicar»). El panel no publica nada por sí solo.

### Subir un programa

| Campo | Notas |
|---|---|
| Título | Obligatorio |
| Categoría | Elige una existente o escribe una nueva |
| **Código del programa** | Obligatorio. Solo minúsculas, números y guiones. Se rellena solo desde el título y se puede cambiar. Será la dirección de la página |
| Descripción | Obligatoria |
| Imagen | Opcional. **Cuadrada, de 1000 × 1000 px** (mínimo 800 × 800), en JPG, PNG o WebP. Si no es cuadrada, se recorta por los lados. El panel avisa si no cumple |
| Archivo .mp3 | Obligatorio |
| ¿Es un video-podcast? | Si eliges **Sí**, hay que pegar un enlace de YouTube (`youtube.com` o `youtu.be`). Si eliges **No**, no se pide vídeo |
| Equipo | Casillas con los miembros dados de alta |
| Invitados | Opcional. Texto libre separado por comas (por ejemplo `Alu42, Profe3`). Si se deja en blanco, no se muestra la sección de invitados |

Al guardar, el panel:

- guarda el mp3 en `audios/CODIGO.mp3` y la imagen en `imagenes/CODIGO.ext`,
- actualiza `data/data.js`,
- crea la página `programas/CODIGO/index.html`,
- añade la dirección a `sitemap.xml`.

### Editar un programa

En la lista **Programas** pulsa **Editar**. El formulario se rellena con los datos actuales:

- Si no eliges un mp3 o una imagen nuevos, se mantienen los actuales.
- Si **cambias el código**, la página nueva se crea en la dirección nueva y la antigua se borra. Los enlaces antiguos dejarán de funcionar. Los mp3 e imágenes ya existentes **no se renombran**.
- Si pasas un programa a «No es video-podcast», se quita el enlace de YouTube.

### Eliminar un programa

Quita el programa de `data.js`, borra su página y lo saca del sitemap. **No borra** los archivos de `audios/` ni `imagenes/`: puedes eliminarlos a mano si ya no los necesitas.

### Equipo

El formulario **Añadir miembro del equipo** añade a una persona a una de las tres secciones de la página Equipo: *Profesorado*, *Coordinación* o *Equipo*. Tiene que estar dada de alta antes de poder marcarla en un programa.

En la web, cada sección muestra **4 personas por fila** (2 en pantallas medianas y 1 en móviles). Si una sección tiene **menos de 4**, sus tarjetas se muestran centradas.

---

## Sin el panel: generar las páginas a mano

Si editas `data/data.js` directamente (por ejemplo para añadir un programa), regenera las páginas y el sitemap desde la raíz del proyecto:

```bash
python3 herramientas/generar_programas.py
```

El script crea o actualiza una carpeta por programa en `programas/`, elimina las de programas que ya no existen y reescribe las direcciones de programas en `sitemap.xml`.

---

## Probar en local

```bash
python3 -m http.server 8000
```

Después abre <http://localhost:8000>.

---

## Publicar en GitHub Pages

1. En el repositorio, ve a **Settings → Pages** y elige como origen la rama `main` y la carpeta raíz (`/`).
2. Sube los cambios:

```bash
git add .
git commit -m "Describe el cambio"
git push
```

3. En uno o dos minutos la web estará actualizada.

Notas:

- GitHub no admite archivos de **más de 100 MB**, y se recomienda que el repositorio no pase de 1 GB. Los mp3 pesan mucho: comprímelos si hace falta. Los vídeos no se suben: se enlazan desde YouTube.
- Las direcciones **distinguen mayúsculas y minúsculas**, por eso los códigos van siempre en minúsculas.
- Las direcciones del sitemap y las etiquetas `canonical` usan `https://www.radiobezmiliana.es`. Si cambia el dominio, actualiza la constante `DOM` en `js/admin.js` y en `herramientas/generar_programas.py`, y vuelve a generar las páginas.
- `admin.html` es público como el resto de la web (aunque el repositorio sea privado, la web publicada en GitHub Pages es accesible), pero sin acceso a tu carpeta no puede modificar nada. Lleva `noindex` para que los buscadores no lo indexen.

---

## Sobre la descarga del audio

Los reproductores no muestran el botón de descarga y bloquean el clic derecho, y `robots.txt` evita que los buscadores indexen `/audios/`. **No es una protección real**: al ser una web estática, quien conozca la dirección de un mp3 puede descargarlo. Si hiciera falta protegerlos de verdad, habría que alojar los audios en un servicio de streaming con enlaces que caducan.

---

## Personalizar el diseño

Los colores, tipografías y espacios están definidos como variables en `:root`, al principio de `style.css`. Las tipografías (Big Shoulders Display, Inter e IBM Plex Mono) se cargan desde Google Fonts.

---

© 2026 Radio Bezmiliana · IES Bezmiliana, Rincón de la Victoria (Málaga)
