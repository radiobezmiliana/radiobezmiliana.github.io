# Radio Bezmiliana · Web

Página web estática (HTML + CSS, sin JavaScript) de la radio escolar del IES Bezmiliana.

## Archivos

```
index.html
styles.css
logo-radio-bezmiliana.png
logo-ies-bezmiliana.png
```

## Qué hay que editar (busca los comentarios `EDITAR` en index.html)

1. **Banner de inscripciones** (el que sale al entrar): fecha límite y texto.
2. **Programas**: nombre, descripción, curso y profesorado de cada uno. Puedes copiar y pegar una tarjeta `<article class="card">` para añadir más.
3. **Equipo**: nombres, roles e iniciales del círculo. Copia un bloque `<article class="person">` para añadir personas.
4. **Inscripciones**: plazo, pasos y el enlace del formulario (Google Forms, Microsoft Forms, etc.).
5. **Contacto**: correo, redes sociales y dirección reales.

## Cómo funciona el banner

Aparece a los 0,5 s de entrar y se cierra con la ×, con «Ahora no», pulsando fuera o yendo a «Quiero inscribirme». Está hecho solo con CSS, así que **vuelve a salir cada vez que se recarga la página**. Si quieres que aparezca solo una vez por visitante, hay que añadir un poco de JavaScript; dímelo y lo preparo.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `radio-bezmiliana`).
2. Sube todos los archivos a la raíz del repositorio (rama `main`).
3. Ve a **Settings → Pages**.
4. En *Build and deployment*, elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guarda.
5. En uno o dos minutos la web estará en `https://TU-USUARIO.github.io/radio-bezmiliana/`.
