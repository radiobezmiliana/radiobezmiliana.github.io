# Radio Bezmiliana

**La voz del IES Bezmiliana.**

Sitio web de la radio escolar del IES Bezmiliana, en Rincón de la Victoria (Málaga). El alumnado puede descubrir los programas, escuchar sus episodios, conocer al equipo y consultar cómo participar en el proyecto.

**Desarrollado por [@pcastroc08](https://github.com/pcastroc08)**

🌐 **Web:** https://radiobezmiliana.github.io/  
📸 **Instagram:** [@radiobezmiliana](https://www.instagram.com/radiobezmiliana/)  
✉️ **Contacto:** [radiobezmiliana@gmail.com](mailto:radiobezmiliana@gmail.com)

## Contenido

- **Inicio:** presentación de Radio Bezmiliana y acceso a los últimos programas.
- **Programas:** catálogo de episodios con filtros por categoría y reproductor de audio.
- **Equipo:** información sobre coordinación y alumnado participante.
- **Inscríbete:** información para unirse a la radio y enlace al formulario de inscripción.
- **Contacto:** correo electrónico, ubicación del instituto y redes sociales.
- **Administración:** herramienta local para añadir y eliminar programas y miembros del equipo.

## Tecnologías

La web está desarrollada con tecnologías web estándar, sin un framework de frontend ni un servidor de aplicaciones propio:

- HTML5
- CSS3
- JavaScript
- Google Fonts
- GitHub Pages para la publicación

## Estructura del proyecto

```text
radiobezmiliana.github.io/
├── index.html             # Página principal
├── programas.html         # Catálogo de programas
├── equipo.html            # Equipo de la radio
├── inscribete.html        # Información de inscripción
├── contacto.html          # Datos de contacto
├── admin.html             # Panel de administración local
├── style.css              # Estilos de la web
├── data/
│   └── data.js            # Categorías, programas y miembros del equipo
├── js/
│   ├── site.js             # Navegación y contenido dinámico
│   └── admin.js            # Lógica del panel de administración
├── assets/
│   ├── icons/              # Favicon e iconos de la web
│   └── logo-*.{png,webp}   # Logotipos
├── audios/                 # Episodios y audios de demostración
├── imagenes/               # Imágenes de programas
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

## Desarrollo local

1. Descarga o clona este repositorio.
2. Abre la carpeta del proyecto.
3. Para probar la web, inicia un servidor estático local desde esa carpeta. Por ejemplo, con Python:

   ```bash
   python -m http.server 8000
   ```

4. Abre `http://localhost:8000` en el navegador.

También puedes abrir `index.html` directamente para consultar parte del sitio, aunque un servidor local es la opción recomendada para probar todas sus funciones.

## Gestionar el contenido

Los datos que muestra la web se encuentran en `data/data.js`, en el objeto `window.RB_DATA`. Ahí se definen:

- `categorias`: categorías disponibles para clasificar programas.
- `equipo.coordinacion`: personas de coordinación.
- `equipo.alumnado`: alumnado participante.
- `programas`: título, descripción, categoría, imagen, archivo de audio y equipo responsable de cada programa.
- `formularioUrl`: URL opcional del formulario de inscripción.

Los archivos de audio se guardan en `audios/` y las imágenes de los programas en `imagenes/`. Las rutas guardadas en `data/data.js` deben coincidir con las ubicaciones reales de esos archivos.

### Panel de administración

`admin.html` incluye una herramienta para gestionar el contenido desde el navegador:

1. Abre la web desde un servidor local en **Chrome o Microsoft Edge**.
2. Entra en `admin.html`.
3. Pulsa **Elegir carpeta de la web** y selecciona la carpeta del proyecto que contiene `index.html`.
4. Añade programas o miembros del equipo, o elimina entradas existentes.

El panel utiliza la API de acceso al sistema de archivos del navegador y necesita permiso de escritura. Está pensado para administrar una copia local de los archivos: **los cambios no se publican automáticamente en GitHub Pages**. Después de revisar los archivos modificados, súbelos al repositorio mediante Git o GitHub.

> Recomendación: conserva una copia de seguridad del proyecto antes de realizar cambios desde el panel de administración.

## Publicación

El repositorio está preparado para publicarse con GitHub Pages.

1. Sube los cambios a la rama `main`.
2. En GitHub, abre **Settings → Pages**.
3. Comprueba que la publicación está configurada desde la rama `main` y la carpeta raíz (`/root`).
4. Espera a que finalice el despliegue y comprueba la web publicada.

Al ser una web estática, los archivos HTML, CSS, JavaScript, imágenes y audios se sirven directamente al navegador. No incluye una base de datos ni un backend propio.

## Contribuciones y mantenimiento

Antes de publicar cambios, comprueba que:

- Los enlaces de navegación y el formulario de inscripción funcionan.
- Los archivos de audio e imagen existen y sus rutas son correctas.
- Los programas aparecen en la categoría adecuada.
- La web se visualiza correctamente en móvil y ordenador.
- No se publican datos personales ni contenido sin autorización.

## Licencia

Este proyecto está protegido por derechos de autor. **Todos los derechos reservados.**

No se permite copiar, modificar, redistribuir ni reutilizar el código, el diseño o los recursos originales sin autorización previa y expresa del titular de los derechos.

Los logotipos institucionales, fotografías, grabaciones, música y demás materiales de terceros pueden estar sujetos a derechos y condiciones independientes.

Para solicitar autorización de uso, contacta con el titular del proyecto.
