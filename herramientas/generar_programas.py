#!/usr/bin/env python3
"""Genera programas/CODIGO/index.html para cada programa de data/data.js
y actualiza sitemap.xml. Ejecútalo desde la raíz de la web:
    python3 herramientas/generar_programas.py
(El panel admin.html hace lo mismo automáticamente al guardar un programa.)"""
import json, re, shutil, html, pathlib, unicodedata
ROOT = pathlib.Path(__file__).resolve().parent.parent
DOM = "https://www.radiobezmiliana.es"
t = (ROOT / "data/data.js").read_text(encoding="utf-8")
D = json.loads(t[t.index("{"):t.rindex("}") + 1])
def slug(s):
    s = unicodedata.normalize("NFD", s); s = re.sub(r"[\u0300-\u036f]", "", s).lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")
TPL = """<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{titulo} | Radio Bezmiliana</title>
        <meta name="description" content="{desc}">
        <link rel="canonical" href="{dom}/programas/{codigo}/">
        <meta property="og:title" content="{titulo} | Radio Bezmiliana">
        <meta property="og:description" content="{desc}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="{dom}/programas/{codigo}/">
        <link rel="icon" href="../../assets/icons/favicon.ico">
        <link rel="apple-touch-icon" href="../../assets/icons/apple-touch-icon.png">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Inter:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap">
        <link rel="stylesheet" href="../../style.css">
    </head>
    <body data-page="programa" data-root="../../" data-codigo="{codigo}">
        <main id="programa">
            <noscript><p class="container">{titulo}: {desc}</p></noscript>
        </main>
        <script src="../../data/data.js"></script>
        <script src="../../js/site.js"></script>
    </body>
</html>
"""
codes = set()
for p in D["programas"]:
    c = p.get("codigo") or slug(p["titulo"]); codes.add(c)
    d = ROOT / "programas" / c; d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(TPL.format(titulo=html.escape(p["titulo"]), desc=html.escape(p["descripcion"], quote=True), codigo=c, dom=DOM), encoding="utf-8")
# Carpetas de programas que ya no existen
for d in (ROOT / "programas").iterdir():
    if d.is_dir() and d.name not in codes: shutil.rmtree(d)
# /programas/ -> listado
(ROOT / "programas/index.html").write_text('<!DOCTYPE html>\n<html lang="es"><head><meta charset="utf-8"><title>Programas | Radio Bezmiliana</title><meta name="robots" content="noindex"><link rel="canonical" href="%s/programas.html"><meta http-equiv="refresh" content="0; url=../programas.html"></head><body><a href="../programas.html">Ir a Programas</a></body></html>\n' % DOM, encoding="utf-8")
# Sitemap
sm = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
sm = re.sub(r"\s*<url>\s*<loc>[^<]*/programas/[^<]+</loc>.*?</url>", "", sm, flags=re.S)
extra = "".join("\n  <url>\n    <loc>%s/programas/%s/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>" % (DOM, c) for c in sorted(codes))
sm = sm.replace("</urlset>", extra.lstrip("\n") + "\n</urlset>")
(ROOT / "sitemap.xml").write_text(sm, encoding="utf-8")
print("Programas generados:", ", ".join(sorted(codes)))
